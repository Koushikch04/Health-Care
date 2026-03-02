import React from "react";
import ErrorFallback from "./ErrorFallback";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled UI error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || ErrorFallback;
      return <Fallback onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
