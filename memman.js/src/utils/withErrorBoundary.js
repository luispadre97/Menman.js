export function withErrorBoundary(component, props) {
    try {
        return component(props);
    } catch (error) {
        console.error("Error in component:", error);
        // Puedes devolver una representación de un componente de error aquí, si lo deseas.
        return null;
    }
}