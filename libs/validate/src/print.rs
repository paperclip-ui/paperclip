use anyhow::Result;
use colored::Colorize;
use paperclip_common::fs::FileReader;
use paperclip_proto::notice::base::{Level, Notice, NoticeResult};
use std::{self};

#[derive(Debug, PartialEq)]
pub struct Message {
    // Code snippet printed
    pub relative_path: String,
    pub lines: Option<Vec<String>>,
    pub notice: Notice,
}

impl Message {
    pub fn from<TIO: FileReader>(notice: &Notice, project_dir: &str, io: &TIO) -> Result<Self> {
        let content = io.read_file(&notice.path)?;
        let content = std::str::from_utf8(&*content).unwrap().to_string();

        Ok(Self {
            relative_path: notice.path.replace(&project_dir, ""),
            lines: notice.content_range.as_ref().and_then(|range| {
                let lines = content
                    .split("\n")
                    .map(|line| line.to_string())
                    .collect::<Vec<String>>();
                let start = range.start.as_ref().expect("Start must exist");
                let end = range.end.as_ref().expect("End must exist");

                let relevant_lines = &lines[(start.line - 1) as usize..end.line as usize];

                Some(relevant_lines.to_vec())
            }),
            notice: notice.clone(),
        })
    }
}

impl ToString for Message {
    fn to_string(&self) -> String {
        let level = if self.notice.level == Level::Error.into() {
            "error".bright_red().bold().to_string()
        } else if self.notice.level == Level::Warning.into() {
            "warning".bright_yellow().bold().to_string()
        } else {
            "".to_string()
        };

        let range = if let Some(range) = &self.notice.content_range {
            let start = range.start.as_ref().expect("Start must exist");
            format!(":{}:{}", start.line, start.column)
        } else {
            "".to_string()
        };

        let mut buffer = format!(
            "{}{} - {}: {}\n\n",
            self.relative_path.cyan(),
            range.yellow(),
            level,
            self.notice.message.as_str().bold()
        );
        if let Some(range) = &self.notice.content_range {
            let start = range.start.as_ref().expect("Start must exist");
            let end = range.end.as_ref().expect("Start must exist");
            if let Some(lines) = &self.lines {
                for (i, line) in lines.iter().enumerate() {
                    let cline = start.line + i as u32;
                    buffer = format!(
                        "{}{}: {}\n",
                        buffer,
                        cline.to_string().as_str().bold(),
                        line
                    );

                    let pre = " ".repeat(cline.to_string().len());

                    if start.line == end.line {
                        buffer = format!(
                            "{}{}{}{}\n",
                            buffer,
                            pre,
                            " ".repeat((start.column + 1) as usize),
                            "^".repeat((end.column - start.column) as usize)
                                .bold()
                                .bright_red()
                        );
                    } else if cline == start.line {
                        buffer = format!(
                            "{}{}{}{}\n",
                            buffer,
                            pre,
                            " ".repeat((start.column + 1) as usize),
                            "^".repeat((line.len() as u32 - start.column) as usize)
                                .bold()
                                .bright_red()
                        );
                    } else if cline == end.line {
                        buffer = format!(
                            "{}{}{}\n",
                            buffer,
                            pre,
                            "^".repeat((end.column + 1) as usize).bold().bright_red()
                        );
                    } else {
                        buffer = format!(
                            "{}{}{}\n",
                            buffer,
                            pre,
                            "^".repeat(line.len()).bold().bright_red()
                        );
                    }
                }
                buffer = format!("{}\n", buffer);
            }
        }

        return buffer.to_string();
    }
}

#[derive(PartialEq)]
pub struct PrettyPrint {
    pub messages: Vec<Message>,
}

impl PrettyPrint {
    pub fn from_notice<TIO: FileReader>(
        notice: &NoticeResult,
        project_dir: &str,
        io: &TIO,
    ) -> Result<PrettyPrint> {
        let mut messages: Vec<Message> = vec![];

        for notice in &notice.notices {
            messages.push(Message::from(notice, project_dir, io)?);
        }

        Ok(PrettyPrint { messages })
    }
    pub fn has_some(&self) -> bool {
        return self.messages.len() > 0;
    }
}

impl ToString for PrettyPrint {
    fn to_string(&self) -> String {
        return self
            .messages
            .iter()
            .map(|message| message.to_string())
            .collect::<Vec<String>>()
            .join("\n");
    }
}
