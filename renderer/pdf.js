/**
 * PDF Export Bridge - Interfaces with preload API for printing
 */

const PDFExporter = {
  async exportResume() {
    // Check if running in Electron environment
    if (window.electronAPI && typeof window.electronAPI.savePDF === 'function') {
      try {
        showToast('Preparing PDF file creation...', 2000);
        
        // Call the main Electron printToPDF handler exposed via preload.js
        const result = await window.electronAPI.savePDF();
        
        if (result.success) {
          showToast(`Resume exported successfully to:\n${result.filePath}`, 5000);
        } else if (result.cancelled) {
          showToast('PDF Export cancelled.', 2500);
        } else {
          showToast(`Failed to export PDF: ${result.error}`, 4000);
        }
      } catch (error) {
        console.error('PDF Export Action failed:', error);
        showToast('Error: Electron print context is unavailable.', 4000);
      }
    } else {
      // Web browser print fallback
      showToast('Opening print setup... Select "Save as PDF" to export.', 3500);
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }

};

// Global Toast utility
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');
  
  if (!toast || !toastMsg) return;

  toastMsg.innerText = message;
  toast.classList.remove('hidden');
  
  // Trigger transition
  setTimeout(() => {
    toast.classList.add('show');
  }, 50);

  // Clear timeout to avoid multiple timers overlapping
  if (window.toastTimeout) {
    clearTimeout(window.toastTimeout);
  }

  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 300);
  }, duration);
}
