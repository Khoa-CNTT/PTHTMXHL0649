import { ChatPage, GroupPage, NotFoundPage, ProfilePage, ReplyPage, SavedsPage, SearchPage, SettingPage, VerifyPage } from "~/pages";
import FundraisingPage from "~/pages/FundraisingPage";
import PaymentFailed from "~/pages/Payment/PaymentFailed";
import PaymentSuccess from "~/pages/Payment/PaymentSuccess";

export const route = [
    {
        path: '/profile/:id',
        element: ProfilePage,
    },
    {
        path: '/group/:id',
        element: GroupPage,
    },
    {
        path: '*',
        element: NotFoundPage,
    },
    {
        path: '/post/:id',
        element: ReplyPage,
    },
    {
        path: '/chat',
        element: ChatPage,
    },
    {
        path: '/settings',
        element: SettingPage,
    },
    {
        path: '/saveds',
        element: SavedsPage,
    },
    {
        path: '/verify-email',
        element: VerifyPage,
    },
    {
        path: '/search',
        element: SearchPage,
    },
    {
        path: '/fundraisers/payment-success',
        element: PaymentSuccess,
    },
    {
        path: '/fundraisers/payment-success',
        element: PaymentFailed,
    },
    {
        path: '/fundraisers',
        element: FundraisingPage,
    }
]

