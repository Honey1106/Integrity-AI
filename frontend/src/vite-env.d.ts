// CSS module/side-effect import declarations for TypeScript bundler mode.
// Vite handles CSS transforms at runtime; these declarations satisfy the type checker.
declare module '*.css' {
  const styles: Record<string, string>
  export default styles
}
