import * as vscode from "vscode";

import { MainController } from "./main_controller";
import { getNeovimPath, getNeovimInitPath, EXT_ID, EXT_NAME } from "./utils";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    const ext = vscode.extensions.getExtension("asvetliakov.vscode-neovim-hacked")!;
    const settings = vscode.workspace.getConfiguration(EXT_NAME);
    const neovimPath = getNeovimPath();
    if (!neovimPath) {
        vscode.window.showErrorMessage("Neovim: configure the path to neovim and restart the editor");
        return;
    }
    const isWindows = process.platform == "win32";

    const highlightConfIgnore = settings.get("highlightGroups.ignoreHighlights");
    const highlightConfHighlights = settings.get("highlightGroups.highlights");
    const highlightConfUnknown = settings.get("highlightGroups.unknownHighlight");
    const mouseVisualSelection = settings.get("mouseSelectionStartVisualMode", false);
    const useCtrlKeysNormalMode = settings.get("useCtrlKeysForNormalMode", true);
    const useCtrlKeysInsertMode = settings.get("useCtrlKeysForInsertMode", true);
    const useWsl = isWindows && settings.get("useWSL", false);
    const revealCursorScrollLine = settings.get("revealCursorScrollLine", false);
    const neovimWidth = settings.get("neovimWidth", 1000);
    const customInit = getNeovimInitPath() ?? "";
    const logPath = settings.get("logPath", "");
    const logLevel = settings.get("logLevel", "none");
    const outputToConsole = settings.get("logOutputToConsole", false);
    const textDecorationsAtTop = settings.get("textDecorationsAtTop", false);

    vscode.commands.executeCommand("setContext", "neovim.ctrlKeysNormal", useCtrlKeysNormalMode);
    vscode.commands.executeCommand("setContext", "neovim.ctrlKeysInsert", useCtrlKeysInsertMode);

    try {
        const plugin = new MainController({
            customInitFile: customInit,
            extensionPath: context.extensionPath.replace(/\\/g, "\\\\"),
            highlightsConfiguration: {
                highlights: highlightConfHighlights,
                ignoreHighlights: highlightConfIgnore,
                unknownHighlight: highlightConfUnknown,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
            mouseSelection: mouseVisualSelection,
            neovimPath: neovimPath,
            neovimViewportHeight: 201,
            useWsl: ext.extensionKind === vscode.ExtensionKind.Workspace ? false : useWsl,
            neovimViewportWidth: neovimWidth,
            textDecorationsAtTop: textDecorationsAtTop,
            revealCursorScrollLine: revealCursorScrollLine,
            logConf: {
                logPath,
                outputToConsole,
                level: logLevel,
            },
        });
        context.subscriptions.push(plugin);
        await plugin.init();
    } catch (e) {
        vscode.window.showErrorMessage(`Unable to init vscode-neovim: ${(e as Error).message}`);
    }
}

// this method is called when your extension is deactivated
export function deactivate(): void {
    // ignore
}
