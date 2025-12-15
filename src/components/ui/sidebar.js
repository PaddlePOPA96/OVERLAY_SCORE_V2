export function Sidebar({ className = "", ...props }) {
  const merged = `${className}`.trim();
  return <aside className={merged} {...props} />;
}

export function SidebarHeader({ className = "", ...props }) {
  const merged = `${className}`.trim();
  return <div className={merged} {...props} />;
}

export function SidebarSection({ className = "", ...props }) {
  const merged = `${className}`.trim();
  return <div className={merged} {...props} />;
}

export function SidebarFooter({ className = "", ...props }) {
  const merged = `${className}`.trim();
  return <div className={merged} {...props} />;
}

export function SidebarItem({
  active = false,
  isDark = false,
  className = "",
  ...props
}) {
  const base = "dashboard-nav-item";
  const activeClass = isDark
    ? "dashboard-nav-item-active-dark"
    : "dashboard-nav-item-active-light";
  const inactiveClass = isDark
    ? "dashboard-nav-item-inactive-dark"
    : "dashboard-nav-item-inactive-light";

  const merged = `${base} ${active ? activeClass : inactiveClass} ${className}`.trim();

  return <button type="button" className={merged} {...props} />;
}
