import WishlistItem from "./WishlistItem";

const MemberWishlist = ({ member }) => {
  return (
    <div className="border rounded-lg p-4 shadow w-[800px]">
      <h3 className="font-bold text-lg mb-2">{member.name}</h3>
      <div className="flex overflow-x-auto">
        {member.wishlist.map((item) => (
          <WishlistItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default MemberWishlist;
