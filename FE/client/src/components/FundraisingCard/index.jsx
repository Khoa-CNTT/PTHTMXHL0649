import { useTranslation } from "react-i18next";
import { Button } from "~/components";
import { FaPlus } from "react-icons/fa6";
import FundraisingItem from "~/components/FundraisingCard/FundraisingItem";
import { FaArrowRight } from "react-icons/fa6";

const FundraisingCard = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-primary rounded-2xl px-6 py-5 shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed">
      <div className="flex items-center justify-between text-ascent-1 pb-2 ">
        <Button
          title="New campaign"
          className="bg-blue py-2 px-3 rounded-xl text-primary"
          iconRight={<FaPlus />}
        />
        <div className="flex items-center gap-x-1 text-blue">
          <span>View all</span>
          <FaArrowRight />
        </div>
      </div>

      <div>
        <FundraisingItem />
      </div>
    </div>
  );
};

export default FundraisingCard;
