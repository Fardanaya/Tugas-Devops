import { LuShirt } from "react-icons/lu";

const CatalogTitle = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="flex items-center gap-4">
      <LuShirt size={32} className="text-primary" />
      <div className="flex flex-col">
        <p className="text-2xl text-primary font-bold tracking-wider">
          {title}
        </p>
        <p className="text-sm">{description}</p>
      </div>
    </div>
  );
};

export default CatalogTitle;
