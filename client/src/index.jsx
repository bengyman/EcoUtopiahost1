import '@mantine/dates/styles.css';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext.jsx';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

//components
import Navbar from './components/Navbar.jsx';

// Pages
import App from './pages/App.jsx';
import TestPage from './pages/Test/TestPage.jsx';

//accounts
import Registration from './pages/Accounts/Registration.jsx';
import Login from './pages/Accounts/Login.jsx';
import Profile from './pages/Accounts/Profile.jsx';
import PublicProfile from './pages/Accounts/PublicProfile.jsx';
import EditProfile from './pages/Accounts/EditProfile.jsx';
import ChangePassword from './pages/Accounts/ChangePassword.jsx';
import ResetPasswordEnterEmail from './pages/Accounts/ResetPasswordEnterEmail.jsx';
import ResetPassword from './pages/Accounts/ResetPassword.jsx';
import PasswordResetSuccess from './pages/Accounts/ResetPasswordSuccess.jsx';
import AccountManagement from './pages/Accounts/AccountManagement.jsx';
import AccountActivation from './pages/Accounts/AccountActivation.jsx';
import FollowersList from './pages/Accounts/FollowersList.jsx';
import FollowingList from './pages/Accounts/FollowingList.jsx';

//courses
import Courses from './pages/Courses/Courses.jsx';
import ViewCourse from './pages/Courses/ViewCourse.jsx';
import AdminCourses from './pages/Courses/AdminCourses.jsx';
import CreateCourse from './pages/Courses/CreateCourse.jsx';
import EditCourse from './pages/Courses/EditCourse.jsx';
//forum
import Posts from './pages/Forum/Posts.jsx';
import CreatePost from './pages/Forum/CreatePost.jsx';
import EditPost from './pages/Forum/EditPost.jsx';
import PostDetails from './pages/Forum/PostDetails.jsx';
import AdminPostsTable from './pages/Forum/PostsTable.jsx';
import ImagePage from './pages/Forum/ImagePage.jsx';
import CommentTable from './pages/Forum/CommentTable.jsx';
//orders
import Orders from './pages/Orders/Orders.jsx';
import OrderDetails from './pages/Orders/OrderDetails.jsx';
import AdminOrders from './pages/Orders/AdminOrders.jsx';
import Success from './pages/Orders/Success.jsx';
//rewards
import Rewards from './pages/Rewards/Reward.jsx';
import RewardDetail from './pages/Rewards/RewardDetail.jsx';
import ViewReward from './pages/Rewards/ViewReward.jsx';
// instructor
import InstructorCourse from './pages/Instructor/InstructorCourse.jsx';


import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'
import '@mantine/core/styles.css';
import { Box, MantineProvider, createTheme, rem } from '@mantine/core'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const theme = createTheme({
  //primaryColor: 'violet'
  colors: {
    /* Add your custom colors here */
    deepBlue: [
      '#eef3ff',
      '#dce4f5',
      '#b9c7e2',
      '#94a8d0',
      '#748dc1',
      '#5f7cb8',
      '#5474b4',
      '#44639f',
      '#39588f',
      '#2d4b81',
    ],
  },

  shadows: {
    md: '1px 1px 3px rgba(0, 0, 0, .25)',
    xl: '5px 5px 3px rgba(0, 0, 0, .25)',
  },

  headings: {
    fontFamily: 'Roboto, sans-serif',
    sizes: {
      h1: { fontSize: rem(36) },
    },
  },
})

function Main() {
  return (
    <>
      <Navbar />
      <Box padding="xl" style={{ marginTop: '70px' }} />
      <Routes>
        <Route path="/" element={<App />} />
        
        <Route path="/test" element={<TestPage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:paramId" element={<Profile />} />
        <Route path="/publicprofile/:paramId" element={<PublicProfile />} />
        <Route path="/edit-profile/:id" element={<EditProfile />} />
        <Route path="/change-password/:id" element={<ChangePassword />} />
        <Route path="/reset-password-email" element={<ResetPasswordEnterEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
        <Route path="/account-management" element={<AccountManagement />} />
        <Route path="/account-activation" element={<AccountActivation />} />
        <Route path="/followers/:paramId" element={<FollowersList />} />
        <Route path="/following/:paramId" element={<FollowingList />} />

        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:courseId" element={<ViewCourse />} />
        <Route path="/admin/view-courses" element={<AdminCourses />} />
        <Route path="/admin/create-course" element={<CreateCourse />} />
        <Route path="/admin/edit-course/:id" element={<EditCourse />} />

        <Route path="/posts" element={<Posts />} />
        <Route path="/createPost" element = {<CreatePost />} />
        <Route path="/edit/:id" element={<EditPost />} />
        <Route path="/posts/:id" element={<PostDetails />} />
        <Route path ="/admin/posts" element={<AdminPostsTable />} />
        <Route path="/image/:imageUrl" element={<ImagePage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orderdetails/:orderId" element={<OrderDetails />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/success" element={<Success />} />

        <Route path="/admin/comment" element={<CommentTable />} />


        <Route path="/rewards" element={<Rewards />} />
        <Route path="/reward/:rewardId" element={<RewardDetail />} />
        <Route path="/:residentId/reward" element={<ViewReward/>} />

        <Route path="/instructor/courses/:instructorId" element={<InstructorCourse />} />

      </Routes>
    </>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
          <AuthProvider>
            <Elements stripe={stripePromise}>
              <BrowserRouter>
                <Main />
              </BrowserRouter>
            </Elements>
          </AuthProvider>
    </MantineProvider>
  </React.StrictMode>
)