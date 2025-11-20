import Image from "next/image";

type PropType = {
  selected: boolean;
  image: string;
  onClick: () => void;
};

export const Thumb: React.FC<PropType> = (props) => {
  const { selected, image, onClick } = props;

  return (
    <div className="relative w-[100px] embla-thumbs__slide" onClick={onClick}>
      {!selected && (
        <div className="absolute top-0 left-0 w-full h-full bg-default-100/50 z-10" />
      )}
      <div className="relative w-full h-full aspect-square">
        <Image
          alt="/placeholder.jpeg"
          className="object-cover rounded-lg"
          src={image}
          fill
        />
      </div>
    </div>
  );
};
