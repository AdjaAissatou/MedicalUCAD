/**
 * État de défilement partagé entre GSAP ScrollTrigger (qui l'écrit) et la scène
 * R3F (qui le lit dans useFrame). Un simple objet mutable évite de re-rendre
 * React à chaque frame : `target` est la valeur brute du scroll (0→1),
 * `progress` la valeur lissée côté 3D pour un easing doux.
 */
export const scrollState = {
  target: 0,
  progress: 0,
};
