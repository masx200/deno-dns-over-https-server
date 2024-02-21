export async function runCommand(cmd: string, args: string[]): Promise<string> {
    const command = new Deno.Command(cmd, {
        args: args,
    });
    const { code, stdout, stderr } = await command.output();
    // console.assert(code === 0);
    // console.assert("hello\n" === new TextDecoder().decode(stdout));
    // console.assert("world\n" === new TextDecoder().decode(stderr));
    if (code !== 0) {
        // console.log("Error: " + new TextDecoder().decode(stderr));
        throw new Error(
            `Command failed with exit code ${code} . Error:` +
                new TextDecoder().decode(stderr),
        );
    }
    return new TextDecoder().decode(stdout);
}
