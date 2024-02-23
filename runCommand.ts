/**
 * 运行命令并返回结果
 * @param cmd 命令字符串
 * @param args 命令参数数组
 * @returns 返回命令执行结果
 */
export async function runCommand(cmd: string, args: string[]): Promise<string> {
    // 创建命令对象
    const command = new Deno.Command(cmd, {
        args: args,
    });
    // 执行命令并获取输出结果
    const { code, stdout, stderr } = await command.output();
    // 如果命令执行失败，则抛出异常
    if (code !== 0) {
        throw new Error(
            `Command failed with exit code ${code} . Error:` +
                new TextDecoder().decode(stderr),
        );
    }
    // 返回命令执行结果
    return new TextDecoder().decode(stdout);
}
