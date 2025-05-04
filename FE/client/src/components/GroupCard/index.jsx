import { Link } from "react-router-dom";
import { GroupAvatar } from "~/assets";

const GroupCard = ({ group }) => {
  return (
    <Link to={"/group/" + group?.id} className="w-full">
      <div className="w-full flex items-center gap-3 justify-between">
        <img
          src={GroupAvatar}
          alt="group"
          className="w-12 h-12 object-cover rounded-full"
        />
        <div className="w-full flex flex-col gap-y-1">
          <span className="text-sm font-semibold text-ascent-1">
            {group?.name}
          </span>
          <span className="text-xs text-ascent-2">
            {group?.memberCount} members
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GroupCard;
