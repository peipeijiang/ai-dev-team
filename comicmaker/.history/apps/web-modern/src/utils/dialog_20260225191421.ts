/**
 * Dialog 工具函数
 * 使用 HTML5 dialog 元素实现弹窗
 */

export function showConfirmDialog(message: string, title: string = '确认', type: 'info' | 'danger' | 'default' = 'default'): Promise<boolean> {
    return new Promise((resolve) => {
        const dialog = document.createElement('dialog') as HTMLDialogElement;
        dialog.className = 'confirm-dialog';
        if (type === 'danger') {
            dialog.setAttribute('data-type', 'danger');
        }
        dialog.innerHTML = `
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>${title}</h3>
                </div>
                <div class="dialog-body">
                    <p>${message}</p>
                </div>
                <div class="dialog-actions">
                    <button class="btn btn-secondary" data-action="cancel">取消</button>
                    <button class="btn btn-primary" data-action="confirm">确定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        const confirmBtn = dialog.querySelector('[data-action="confirm"]');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                dialog.close();
                if(document.body.contains(dialog)) document.body.removeChild(dialog);
                resolve(true);
            });
        }
        
        const cancelBtn = dialog.querySelector('[data-action="cancel"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                dialog.close();
                if(document.body.contains(dialog)) document.body.removeChild(dialog);
                resolve(false);
            });
        }
        
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.close();
                if(document.body.contains(dialog)) document.body.removeChild(dialog);
                resolve(false);
            }
        });
        
        dialog.showModal();
    });
}

export function showAlertDialog(message: string, title: string = '提示'): Promise<void> {
    return new Promise((resolve) => {
        const dialog = document.createElement('dialog') as HTMLDialogElement;
        dialog.className = 'alert-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>${title}</h3>
                </div>
                <div class="dialog-body">
                    <p>${message}</p>
                </div>
                <div class="dialog-actions">
                    <button class="btn btn-primary" data-action="ok">确定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        const okButton = dialog.querySelector('[data-action="ok"]');
        if (okButton) {
            okButton.addEventListener('click', () => {
                dialog.close();
                if(document.body.contains(dialog)) document.body.removeChild(dialog);
                resolve();
            });
        }
        
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.close();
                if(document.body.contains(dialog)) document.body.removeChild(dialog);
                resolve();
            }
        });

        dialog.showModal();
    });
}
