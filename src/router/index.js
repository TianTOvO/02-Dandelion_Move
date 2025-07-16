import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Tasks from '@/views/Tasks.vue'
import TaskDetail from '@/views/TaskDetail.vue'
import CreateTask from '@/views/CreateTask.vue'
import Profile from '@/views/Profile.vue'
import Arbitration from '@/views/Arbitration.vue'
import Test from '@/views/Test.vue'
import TestContract from '@/views/TestContract.vue'
import TimelineTest from '@/components/TimelineTest.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/tasks',
      name: 'Tasks',
      component: Tasks
    },
    {
      path: '/task/:id',
      name: 'TaskDetail',
      component: TaskDetail,
      props: true
    },
    {
      path: '/create-task',
      name: 'CreateTask',
      component: CreateTask
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile
    },
    {
      path: '/arbitration',
      name: 'Arbitration',
      component: () => import('@/views/Arbitration.vue'),
      meta: {
        title: 'DAO治理仲裁'
      }
    },
    {
      path: '/test',
      name: 'Test',
      component: Test
    },
    {
      path: '/test-contract',
      name: 'TestContract',
      component: TestContract
    },
    {
      path: '/time-test',
      name: 'TimeTest',
      component: TimelineTest,
      meta: {
        title: '时间计算测试'
      }
    }
  ]
})

export default router 