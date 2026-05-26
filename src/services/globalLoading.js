import { h } from 'vue'

let loadingService = null
let loaderInstance = null
let pendingRequests = 0
let visibleSince = 0
let hideTimeout = null

const MINIMUM_VISIBLE_TIME = 700

export const configureGlobalLoading = (service) => {
  loadingService = service
}

export const startGlobalLoading = () => {
  pendingRequests += 1

  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }

  if (!loadingService || loaderInstance) {
    return
  }

  visibleSince = Date.now()

  loaderInstance = loadingService.show(
    {
      isFullPage: true,
      canCancel: false,
      lockScroll: true,

      // Diseños disponibles: 'spinner', 'dots' o 'bars'
      loader: 'dots',

      color: '#864a06',
      backgroundColor: '#ffffff',
      opacity: 0.86,
      width: 72,
      height: 72,
      zIndex: 20000,
    },
    {
      after: h('div', { class: 'global-loading-message' }, [
        h(
          'p',
          { class: 'global-loading-title' },
          'Verificando permisos y cargando datos'
        ),
        h(
          'p',
          { class: 'global-loading-description' },
          'Estamos preparando la información solicitada...'
        ),
      ]),
    }
  )
}

export const stopGlobalLoading = () => {
  if (pendingRequests > 0) {
    pendingRequests -= 1
  }

  if (pendingRequests > 0 || !loaderInstance) {
    return
  }

  const elapsedTime = Date.now() - visibleSince
  const remainingTime = Math.max(
    MINIMUM_VISIBLE_TIME - elapsedTime,
    0
  )

  hideTimeout = setTimeout(() => {
    if (pendingRequests === 0 && loaderInstance) {
      loaderInstance.hide()
      loaderInstance = null
      visibleSince = 0
      hideTimeout = null
    }
  }, remainingTime)
}

export const resetGlobalLoading = () => {
  pendingRequests = 0

  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }

  if (loaderInstance) {
    loaderInstance.hide()
    loaderInstance = null
  }

  visibleSince = 0
}