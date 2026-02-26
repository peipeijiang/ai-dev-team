// 简单的对话框工具 (TypeScript Version)

export function showAlertDialog(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): Promise<void> {
    return new Promise((resolve) => {
        alert(`${type.toUpperCase()}: ${message}`);
        resolve();
    });
}

export function showConfirmDialog(message: string, title: string = '确认', type: 'info' | 'danger' = 'info'): Promise<boolean> {
    return new Promise((resolve) => {
        const result = confirm(`${title}\n\n${message}`);
        resolve(result);
    });
}
