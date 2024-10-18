import { createRouter, createWebHistory } from "vue-router";
import { auth } from "@/services/firebase";

import Login from "../components/Login/Login.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: { requiresUnauth: true },
    },
    {
      path: "/",
      name: "Dashboard",
      component: () => import("../views/Home.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/all-media",
      name: "All Media",
      component: () => import("../views/AllMedia.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/manage-records",
      name: "Manage Records",
      component: () => import("../views/Records.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

const getUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresUnauth = to.matched.some(
    (record) => record.meta.requiresUnauth
  );

  const user = await getUser();

  if (requiresAuth && !user) {
    return next({ name: "Login" });
  }

  if (requiresUnauth && user) {
    return next({ name: "Dashboard" });
  }

  next();
});

export default router;
