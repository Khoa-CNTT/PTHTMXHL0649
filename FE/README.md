<h1 align="center">LinkVerse - Social network</h1>
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\chrome_dev"

## Brief description

- A social networking website that allows users to share their emotions, connect with friends, chat with each other, and personalize their content.

## Technologies

- Frontend: ReactJS, MaterialUI, TailwindCSS, Redux Toolkit, React Router, React Hook Form, Tanstack query
- Backend: Java, Spring boot, Spring security, MySQL

## Project details

- User Authentication: Sign in & Sign up with JWT (Login with OTP verification)
- User can:
  - Create stories and groups
  - Create comment, like, share, block
  - Search post with keyword or sentiment, search user
  - View profile, edit profile, verify email, reset password, change status
  - Create post, save post, share post, translate post, change post visibility
- Admin can manage users, posts, and history

## Overview

1. Home page

1.1. Light mode

![Home](https://res.cloudinary.com/duktr2ml5/image/upload/v1739555644/home_light_dgufxl.jpg)
1.2. Dark mode

![Home](https://res.cloudinary.com/duktr2ml5/image/upload/v1739555643/home_dark_pyve5o.jpg)

2. Register page

   ![Register](https://res.cloudinary.com/duktr2ml5/image/upload/v1739555644/register_t9jtt9.jpg)

3. Login page

   ![Login](https://res.cloudinary.com/duktr2ml5/image/upload/v1739555644/login_nk3gqe.jpg)

4. Group page

   ![Group](https://res.cloudinary.com/duktr2ml5/image/upload/v1739555643/group_tsffpr.jpg)

5. Friend page

   ![Friend detail](https://res.cloudinary.com/duktr2ml5/image/upload/v1739555641/friend_request_xhfl3v.jpg)

6. User page

   ![User](https://res.cloudinary.com/duktr2ml5/image/upload/v1739555652/user_profile_gsy11p.jpg)

7. Setting page

   ![Setting](https://res.cloudinary.com/duktr2ml5/image/upload/v1739555650/setting_privacy_vrtyf9.jpg)

8. Reply page

   ![Reply](https://res.cloudinary.com/duktr2ml5/image/upload/v1739555645/reply1_gtie1b.jpg)

9. Modals

9.1 Create post

![Modals](https://res.cloudinary.com/duktr2ml5/image/upload/v1739555645/create_post_n6pumg.jpg)

9.2 Create story

![Modals](https://res.cloudinary.com/duktr2ml5/image/upload/v1739555642/create_story_pvonaj.jpg)

9.3 OTP verification

![Modals](https://res.cloudinary.com/duktr2ml5/image/upload/v1739555641/email_verification_nved4c.jpg)

9.4 Block list

![Modals](https://res.cloudinary.com/duktr2ml5/image/upload/v1739555641/block_list_iawaml.jpg)

9.5 Update user profile

![Modals](https://res.cloudinary.com/duktr2ml5/image/upload/v1739555651/update_user_nq5zcs.jpg)

9.6 Verify email

![Modals](https://res.cloudinary.com/duktr2ml5/image/upload/v1739555651/verify_email_ztx5kz.jpg)

## Installation and setup

1. Clone the repository

```bash
git clone https://github.com/hatuan1423/social-network.git
```

2. Install dependencies & run project

- Frontend

```bash
cd client
npm i
npm run dev
```

3. Environment setup

Create a `.env` file in the folder /src:

- Frontend

```env
VITE_API_URL_BACKEND=http://localhost:8888/api/v1
VITE_API_URL_BACKEND_NOTI=http://localhost:8082
```

## Contact

- Email: dhtuan198@gmail.com
- GitHub: https://github.com/hatuan1423
