import { Component, Fragment } from "react";

const DOM_ERROR_PATTERNS = [
  "removeChild",
  "insertBefore",
  "appendChild",
  "replaceChild",
  "is not a child of this node",
  "no es hijo de este nodo",
  "nodo antes del cual",
];

function isDomExtensionError(error) {
  if (!error?.message) return false;
  return DOM_ERROR_PATTERNS.some((p) => error.message.includes(p));
}

export default class ErrorBoundary extends Component {
  state = { error: null, retryCount: 0 };

  static getDerivedStateFromError(error) {
    if (isDomExtensionError(error)) {
      return null; // No mostrar pantalla de error — componentDidCatch fuerza remount
    }
    return { error };
  }

  componentDidCatch(error, info) {
    if (isDomExtensionError(error)) {
      // Auto-recover: las extensiones del navegador modifican el DOM y
      // dessincronizan React. Forzar re-render limpia el estado.
      this.setState((prev) => ({ error: null, retryCount: prev.retryCount + 1 }));
      return;
    }
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-lg font-semibold text-red-700 mb-2">
              Algo salió mal
            </h2>
            <p className="text-sm text-red-600">
              Ocurrió un problema al cargar esta sección.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return (
      <Fragment key={this.state.retryCount}>
        {this.props.children}
      </Fragment>
    );
  }
}
