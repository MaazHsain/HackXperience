const WishlistItem = ({ item }) => {
  return (
    <div className="min-w-[120px] h-[120px] bg-gray-200 rounded-md flex flex-col items-center justify-center mr-3">
      <img
        src={item.imageUrl}
        alt={item.title}
        className="w-full h-[80px] object-cover rounded"
      />
      <p className="text-xs mt-1">{item.title}</p>
    </div>
  );
};

export default WishlistItem;
