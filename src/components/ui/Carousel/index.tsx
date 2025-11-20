import React, { useState, useEffect, useCallback } from "react";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { Thumb } from "./Thumbnail";
import "./style.css";

type PropType = {
  slides: string[];
  options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(options);
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();

    emblaMainApi.on("select", onSelect).on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);

  return (
    <div className="relative">
      {slides.length > 1 && (
        <div className="absolute top-2 right-2.5 z-10 bg-black/50 rounded-full px-2 py-1">
          <div className="flex items-center gap-[2px] text-[0.6rem] text-white font-medium">
            <p>{selectedIndex + 1}</p>
            <span className="text-[0.45rem]">/</span>
            <p>{slides.length}</p>
          </div>
        </div>
      )}
      <div className="embla">
        <div className="embla__viewport rounded-lg" ref={emblaMainRef}>
          <div className="embla__container">
            {slides.map((slide, index) => (
              <div className="embla__slide" key={index}>
                <div className="relative w-full h-full aspect-square">
                  <Image
                    alt="/placeholder.jpeg"
                    className="object-cover rounded-lg"
                    src={slides?.length > 0 ? slide : "/placeholder.jpeg"}
                    fill
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden md:block">
          {slides.length > 1 && (
            <div className="embla-thumbs">
              <div
                className="embla-thumbs__viewport rounded-lg"
                ref={emblaThumbsRef}
              >
                <div className="embla-thumbs__container">
                  {slides.map((slide, index) => (
                    <Thumb
                      key={index}
                      onClick={() => onThumbClick(index)}
                      selected={index === selectedIndex}
                      image={slide}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;
