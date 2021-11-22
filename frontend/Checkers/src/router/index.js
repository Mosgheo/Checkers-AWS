import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home";
import Profile from "@/views/Profile";
import LeaderBooard from "@/views/LeaderBoard";
import Domande from "@/views/Domande";
import Login from "@/views/Login";
import Signup from "@/views/Signup";

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/leaderboard',
    name: 'LeaderBooard',
    component: LeaderBooard
  },
  {
    path: '/domande',
    name: 'Domande',
    component: Domande
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
