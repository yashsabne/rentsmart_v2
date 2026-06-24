export function redirectAfterLogin(navigate) {
  const target = localStorage.getItem("rentsmart_post_login_redirect");
  if (target) {
    localStorage.removeItem("rentsmart_post_login_redirect");
    navigate(target);
  } else {
    navigate("/dashboard");
  }
}