import { useState } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { searchUser } from "~/redux/Slices/userSlice";
import SelectedMember from "./SelectedMember";
import ChatCard from "../ChatCard";
import NewGroup from "./NewGroup";

const CreateGroupChat = ({ setIsGroup }) => {
  const [newGroup, setNewGroup] = useState(false);
  const [groupMember, setGroupMember] = useState(new Set());
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user);

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
        <div>
          <div className="flex items-center space-x-10 bg-[#069b60] text-white pt-16 px-10 pb-5">
            <BsArrowLeft className="cursor-pointer text-2xl font-bold" />
            <p className="text-xl font-semibold">Add Participants</p>
          </div>

          <div className="relative bg-white py-4 px-3">
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

            <input
              type="text"
              className="outline-none border-b border-[#8888] p-2 w-[93%]"
              placeholder="Search user"
              value={query}
              onChange={(e) => {
                handleSearch(e.target.value);
                setQuery(e.target.value);
              }}
            />
          </div>

          <div className="bg-white overflow-y-scroll h-[50.3vh]">
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
                  <hr />
                  <ChatCard userImg={item.avatar} name={item.lastName} />
                </div>
              ))}
          </div>

          <div className="bottom-10 py-10 bg-slate-200 items-center justify-center flex">
            <div
              onClick={() => {
                setNewGroup(true);
              }}
              className="bg-green-600 rounded-full p-4 cursor-pointer"
            >
              <BsArrowRight className="text-white font-bold text-3xl" />
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

export default CreateGroupChat;
