export function showToast(title: string, message: string, type: 'error' | 'warning' | 'success' = 'error') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-10 right-10 z-[9999] flex flex-col gap-3';
    document.body.appendChild(container);
  }


  const existingToasts = Array.from(container.children);
  const isDuplicate = existingToasts.some(t => t.getAttribute('data-message') === message);
  if (isDuplicate) return;

  const toast = document.createElement('div');
  toast.setAttribute('data-message', message);


  const isError = type === 'error';
  const isWarning = type === 'warning';

  const iconColor = isError ? 'text-rose-500 bg-rose-50' : isWarning ? 'text-amber-500 bg-amber-50' : 'text-emerald-500 bg-emerald-50';
  const icon = isError ? '!' : isWarning ? '⚠' : '✓';
  const borderColor = isError ? 'border-rose-500' : isWarning ? 'border-amber-500' : 'border-emerald-500';

  toast.className = `transform transition-all duration-300 -translate-y-4 opacity-0 flex items-start gap-3 w-[340px] p-4 rounded-xl shadow-[0_12px_40px_rgba(15,23,42,0.08)] bg-white border border-slate-200 border-l-4 ${borderColor}`;

  toast.innerHTML = `
    <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold ${iconColor}">
      ${icon}
    </div>
    <div class="flex-1 pt-0.5">
      <h3 class="font-bold text-[13px] text-slate-800 leading-none">${title}</h3>
      <p class="text-[12.5px] text-slate-500 mt-1.5 whitespace-pre-wrap leading-relaxed">${message}</p>
    </div>
    <button class="text-slate-400 hover:text-slate-600 transition-colors p-1 -mt-1 -mr-1 text-[16px] leading-none">×</button>
  `;

  const closeBtn = toast.querySelector('button');
  closeBtn?.addEventListener('click', () => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('-translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  });

  container.appendChild(toast);

  requestAnimationFrame(() => {
    setTimeout(() => {
      toast.classList.remove('-translate-y-4', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);
  });

  setTimeout(() => {
    if (document.body.contains(toast)) closeBtn?.click();
  }, 6000);
}

export function clearAllToasts() {
  const container = document.getElementById('toast-container');
  if (container) {
    container.innerHTML = '';
  }
}
