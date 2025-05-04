import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import useGetDetailUserById from "@/hooks/useGetDetailUserById";

const PostTableItem = ({ post }) => {
  const { user } = useGetDetailUserById({ id: post?.userId });

  return (
    <TableRow key={post?.id}>
      <TableCell>
        <img src={post?.imageUrl[0]} alt="" />
      </TableCell>
      <TableCell>{user?.username}</TableCell>
      <TableCell>{post?.content}</TableCell>
      <TableCell className="flex items-center gap-x-2">
        <Button>Update</Button>
        <Button>Delete</Button>
      </TableCell>
    </TableRow>
  );
};

export default PostTableItem;
