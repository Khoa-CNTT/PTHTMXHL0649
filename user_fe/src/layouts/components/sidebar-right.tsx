import React from 'react';
import { AvtGroupExpand } from '@components/avatar';
import ProfileCard from '@components/profile-card/profile-card';
import ToggleGroup from '@components/toggle-group/toggle-group';
import { TrendingTopicCard } from '@components/trending-topic-card';
import { _avatarData as fakeAvatarData } from '@_mocks/_avatar';
import { _trendingData as fakeTrending } from '@_mocks/_trending';
import { useLocation } from 'react-router-dom';
import { Typography } from '@components/typography';
import * as FriendService from '@services/friend-service';
import { useQuery } from '@tanstack/react-query';
import { BlankAvatar } from '@assets/index';

export default function SidebarRight() {
  const [activeTab, setActiveTab] = React.useState('1');
  const location = useLocation();

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const isFollowingPage = location.pathname === '/following';

  const fetchFriendsSuggest = async () => {
    const res = await FriendService.friendSuggesstion();
    return res;
  };

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['friends-suggest'],
    queryFn: fetchFriendsSuggest,
  });

  return (
    <section className="bg-background-secondary fixed top-0 right-0 min-h-full flex flex-col p-3 gap-3 w-85 2xl:w-120">
      {!isFollowingPage && (
        <ToggleGroup
          className="w-full p-1 flex justify-between items-center bg-neutral3-60 rounded-[6.25rem]"
          items={[
            { key: '1', label: 'Who to follow' },
            { key: '2', label: 'Trending topics' },
          ]}
          onChange={handleTabChange}
        />
      )}

      {isFollowingPage ? (
        <>
          <Typography
            level="title"
            className="text-tertiary opacity-80 px-3 py-[0.625rem]"
          >
            Trending topics
          </Typography>
          {fakeTrending.map((trending) => (
            <TrendingTopicCard
              key={trending.id}
              thumbnail={trending.thumbnail}
              trendingName={trending.trendingName}
              time={trending.time}
              isNew={trending.isNew}
            />
          ))}
        </>
      ) : (
        <>
          {activeTab === '1' ? (
            <div className="flex flex-col gap-2">
              {data?.result?.length > 0 &&
                data?.result?.map((item) => (
                  <ProfileCard
                    key={item?.id}
                    userName={item?.firstName + ' ' + item?.lastName}
                    src={item?.imageUrl || BlankAvatar}
                    userHandle={`@${item?.username}`}
                  />
                ))}
            </div>
          ) : (
            <>
              {fakeTrending.map((trending) => (
                <TrendingTopicCard
                  thumbnail={trending.thumbnail}
                  key={trending.id}
                  trendingName={trending.trendingName}
                  time={trending.time}
                  isNew={trending.isNew}
                />
              ))}
            </>
          )}
        </>
      )}

      <AvtGroupExpand
        avatars={fakeAvatarData}
        count="1234"
        className="size-[2rem] min-w-[2rem]"
      />
    </section>
  );
}
