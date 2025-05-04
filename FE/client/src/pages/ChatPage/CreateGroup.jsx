import { useState } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import SelectedMember from "~/pages/ChatPage/SelectedMember";
import ChatCard1 from "~/pages/ChatPage/ChatCard1";
import NewGroup from "~/pages/ChatPage/NewGroup";
import { searchUser } from "~/redux/Slices/userSlice";
import { BlankAvatar } from "~/assets";
import {
  IoIosArrowForward,
  IoIosArrowRoundBack,
  IoIosArrowRoundForward,
} from "react-icons/io";

const CreateGroup = ({ setIsGroup }) => {
  const [newGroup, setNewGroup] = useState(false);
  const [groupMember, setGroupMember] = useState(new Set());
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const handleRemoveMember = (item) => {
    const updatedMembers = new Set(groupMember);
    updatedMembers.delete(item);
    setGroupMember(updatedMembers);
  };

  const handleSearch = (keyword) => {
    dispatch(searchUser(keyword));
  };

  return (
    <div className="w-full h-full">
      {!newGroup && (
        <div className="p-5">
          {/* Header */}
          <div className="flex py-5 px-5 rounded-2xl items-center bg-bgSearch text-white relative">
            <IoIosArrowRoundBack
              size={30}
              className="cursor-pointer text-ascent-1 text-xl font-bold absolute left-5"
              onClick={() => setIsGroup(false)}
            />
            <p className="w-full text-base text-ascent-1 text-center font-semibold">
              Add Participants
            </p>
          </div>

          <div className="relative bg-primary py-4 px-3">
            {/* Showing and removing group members */}
            <div className="flex space-x-2 flex-wrap space-y-1">
              {groupMember.size > 0 &&
                Array.from(groupMember).map((item, index) => (
                  <SelectedMember
                    key={index}
                    handleRemoveMember={(item) => handleRemoveMember(item)}
                    member={item}
                  />
                ))}
            </div>

            {/* Adding group members */}
            <input
              type="text"
              className="outline-none bg-transparent border-b border-borderNewFeed p-2 w-[93%]"
              placeholder="Search user"
              value={query}
              onChange={(e) => {
                handleSearch(e.target.value);
                setQuery(e.target.value);
              }}
            />
          </div>

          <div className="bg-primary h-[59vh] overflow-y-scroll">
            {query &&
              user.searchUser?.map((item) => (
                <div
                  onClick={() => {
                    groupMember.add(item);
                    setGroupMember(groupMember);
                    setQuery("");
                  }}
                  key={item?.id}
                >
                  <ChatCard1
                    userImg={item?.imageUrl || BlankAvatar}
                    name={item.username}
                    fullName={item?.firstName + " " + item?.lastName}
                  />
                </div>
              ))}
          </div>

          <div className=" bg-bgSearch hover:opacity-90 py-3 active:scale-95 rounded-2xl items-center justify-center flex">
            <div
              onClick={() => {
                setNewGroup(true);
              }}
              className="cursor-pointer"
            >
              <IoIosArrowRoundForward
                size={30}
                className="text-white font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {newGroup && (
        <NewGroup groupMember={groupMember} setIsGroup={setIsGroup} />
      )}
    </div>
  );
};

export default CreateGroup;
