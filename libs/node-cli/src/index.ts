import {loadCLIBinPath } from "@paperclip-ui/releases";
import ora from "ora";
import execa from 'execa';

const spinner = ora('Downloading Paperclip binary...').start();

loadCLIBinPath(__dirname).then((binPath) => {
    execa(binPath, process.argv.slice(2), {
        stdio: 'inherit',
        env: process.env
    });
    spinner.stop();
}).catch((e) => {
    console.error(e);
});

