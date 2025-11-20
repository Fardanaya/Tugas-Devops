import { useMemo, useState, Fragment } from "react";
import type { DateValue, RangeValue } from "@heroui/react";

const formatErrorMessage = (error: string) => {
  const words = error.split(" ");
  if (words.length <= 5) return error;
  return `${words.slice(0, 5).join(" ")}\n${words.slice(5).join(" ")}`;
};

import { extendedTransactionStatus } from "@/hooks/react-query/transaction";
import {
  Calendar as RBCalendar,
  momentLocalizer,
  Views,
  DateLocalizer,
} from "react-big-calendar";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Popover,
  PopoverTrigger,
  RangeCalendar as RC,
  PopoverContent,
  ButtonGroup,
} from "@heroui/react";
import { Button } from "../heroui";
import {
  FaAngleLeft,
  FaAngleRight,
  FaCalendar,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";
import moment from "moment";
import { I18nProvider } from "@react-aria/i18n";

import type {
  CalendarProps,
  Components,
  ToolbarProps,
  EventProps,
} from "react-big-calendar";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./styles.css";
import { ITransaction } from "@/lib/types/schemas/transaction";

const localizer = momentLocalizer(moment);
const Calendar = RBCalendar as React.ComponentType<CalendarProps>;

const CustomToolbar = ({
  label,
  onNavigate,
}: {
  label: string;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex flex-col">
        <p className="text-xl md:text-2xl font-semibold">
          {label.split(" ")[0]}
        </p>
        <p className="font-bold tracking-widest text-primary">
          {label.split(" ")[1]}
        </p>
      </div>
      <div className="flex flex-row justify-center items-center">
        <ButtonGroup>
          <Button isIconOnly color="primary" onPress={() => onNavigate("PREV")}>
            <FaAngleLeft />
          </Button>
          <Button color="primary" onPress={() => onNavigate("TODAY")}>
            Today
          </Button>
          <Button isIconOnly color="primary" onPress={() => onNavigate("NEXT")}>
            <FaAngleRight />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

const RentCalendar = ({
  listData,
  loading,
  ...rest
}: {
  listData: ITransaction[];
  loading: boolean;
  className?: string;
}) => {
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleShowMore = (events: any[], date: Date) => {
    setSelectedDateEvents(events);
    setSelectedDate(date);
    setShowEventsModal(true);
  };

  const events = useMemo(() => {
    if (!Array.isArray(listData)) {
      return [];
    }

    return listData.map((item: any) => ({
      id: item.id,
      title: item.status,
      start: moment(item.start_rent).toDate(),
      end: moment(item.end_rent).add(1, "day").toDate(),
      additional_day: item.additional_day,
      address: item.address,
      catalog: item.catalog,
      final_price: item.final_price,
      payment: item.payment,
      r_shipping: item.r_shipping,
      s_shipping: item.s_shipping,
      total_price: item.total_price,
      user: item.user,
      cancel_reason: item.cancel_reason,
      discount: item.discount,
      dp_payment: item.dp_payment,
      reject_reason: item.reject_reason,
      sett_payment: item.sett_payment,
      sett_reason: item.sett_reason,
      settlement_reason: item.settlement_reason,
    }));
  }, [listData]);

  const CustomEvent = ({ event }: { event: any }) => {
    const status = extendedTransactionStatus.find(
      (s) => s.value === event?.title
    ) || {
      value: "unknown",
      label: "Unknown",
      color: "#A2C8FF",
    };

    return (
      <div>
        <Button
          className="w-full h-8 capitalize"
          style={{ backgroundColor: status.color }}
          radius="sm"
        >
          {status.label} - {event.catalog.name}
        </Button>
      </div>
    );
  };

  const components = {
    toolbar: (props: ToolbarProps) => (
      <CustomToolbar label={props.label} onNavigate={props.onNavigate} />
    ),
    event: (props: EventProps) => <CustomEvent event={props.event} />,
  } as any;

  return (
    <Fragment>
      <Calendar
        {...rest}
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month"]}
        defaultView="month"
        dayLayoutAlgorithm="no-overlap"
        components={components}
        onShowMore={handleShowMore}
        eventPropGetter={(event) => ({
          style: {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
        })}
      />
      <Modal
        isOpen={showEventsModal}
        onClose={() => setShowEventsModal(false)}
        classNames={{
          wrapper: "z-[9999]",
        }}
      >
        <ModalContent>
          <ModalHeader className="border-b border-default-200">
            <h3 className="text-xl font-bold">
              Events for{" "}
              {selectedDate && moment(selectedDate).format("MMMM D, YYYY")}
            </h3>
          </ModalHeader>
          <ModalBody className="p-0 max-h-[70vh] overflow-auto">
            <div className="divide-y divide-default-200">
              {selectedDateEvents.map((event, index) => {
                const status = extendedTransactionStatus.find(
                  (s) => s.value === event?.title
                ) || {
                  value: "unknown",
                  label: "Unknown",
                  color: "#A2C8FF",
                };
                const bgColor = status.color;
                const textColor =
                  parseInt(bgColor.replace("#", ""), 16) > 0xffffff / 2
                    ? "text-black"
                    : "text-white";

                return (
                  <div
                    key={index}
                    className="p-4 hover:bg-default-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: bgColor }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-lg">
                            {event.catalog.name}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${textColor}`}
                            style={{ backgroundColor: bgColor }}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="text-default-600 mt-1">
                          {event.user.full_name}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                          <div>
                            <p className="text-default-500">Start</p>
                            <p>{moment(event.start).format("MMM D, h:mm A")}</p>
                          </div>
                          <div>
                            <p className="text-default-500">End</p>
                            <p>{moment(event.end).format("MMM D, h:mm A")}</p>
                          </div>
                          <div>
                            <p className="text-default-500">Total Price</p>
                            <p>Rp{event.total_price.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-default-500">Status</p>
                            <p>{event.payment?.status || "Pending"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Fragment>
  );
};

const RangeCalendar = ({ max }: { max?: number }) => {
  const [selectedRange, setSelectedRange] =
    useState<RangeValue<DateValue> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRangeChange = (range: RangeValue<DateValue>) => {
    if (!range || !range.start || !range.end) return;

    const startDate = range.start.toDate("Asia/Jakarta");
    const endDate = range.end.toDate("Asia/Jakarta");
    if (max) {
      const diffDays = moment(endDate).diff(moment(startDate), "days") + 1;
      if (diffDays > max) {
        setError(`Maximum ${max} days allowed`);
        return;
      }
      setError(null);
    }
    setSelectedRange(range);
  };

  const displayText = selectedRange
    ? `${moment(selectedRange.start.toDate("Asia/Jakarta")).format(
        "D MMM"
      )} - ${moment(selectedRange.end.toDate("Asia/Jakarta")).format("D MMM")}`
    : "Pilih tanggal";
  return (
    <Popover
      placement="bottom"
      classNames={{
        content: "p-0",
      }}
    >
      <PopoverTrigger>
        <div className="flex flex-row items-center gap-1">
          <div className="flex flex-row items-center gap-2 border-2 border-default-200 hover:border-primary px-3 py-2 rounded-lg w-full">
            <FaCalendar className="text-primary" />
            <p className="text-sm">{displayText}</p>
          </div>
          {selectedRange && (
            <Button isIconOnly onPress={() => setSelectedRange(null)}>
              <FaTimes />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <RC
          onChange={handleRangeChange}
          bottomContent={
            <div className="flex flex-col px-6 mb-4">
              {error && (
                <div className="flex flex-row items-center gap-2">
                  <FaInfoCircle className="text-primary" />
                  <p className="text-xs text-primary">{error}</p>
                </div>
              )}
            </div>
          }
        />
      </PopoverContent>
    </Popover>
  );
};

const CatalogCalendar = ({
  max,
  min,
  date,
  isReadOnly,
  is_weekday,
  isDateUnavailable,
  onRangeChange,
}: {
  max?: number;
  min?: number;
  date?: {
    start: DateValue;
    end: DateValue;
  };
  isDateUnavailable?: (date: DateValue) => boolean;
  isReadOnly?: boolean;
  onRangeChange?: (range: RangeValue<DateValue>) => void;
  is_weekday?: boolean;
}) => {
  const [selectedRange, setSelectedRange] =
    useState<RangeValue<DateValue> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRangeChange = (range: RangeValue<DateValue>) => {
    if (!range || !range.start || !range.end) return;

    const startDate = range.start.toDate("Asia/Jakarta");
    const endDate = range.end.toDate("Asia/Jakarta");

    if (is_weekday === false) {
      const startDay = startDate.getDay();
      if (startDay !== 5 && startDay !== 6) {
        setError("Item ini hanya bisa disewa dari hari Jumat atau Sabtu");
        return;
      }
    }

    if (max || min) {
      const diffDays = moment(endDate).diff(moment(startDate), "days") + 1;
      if (max && diffDays > max) {
        setError(`Maaf, kamu gak boleh sewa lebih dari ${max} hari`);
        return;
      }
      if (min && diffDays <= min) {
        setError(`Pilih minimal ${min + 1} hari`);
        return;
      }
      setError(null);
    }
    setSelectedRange(range);
    if (onRangeChange) {
      onRangeChange(range);
    }
  };

  return (
    <RC
      classNames={{ base: "w-full", content: "w-full" }}
      isReadOnly={isReadOnly}
      isDateUnavailable={isDateUnavailable}
      value={date}
      onChange={handleRangeChange}
      bottomContent={
        <div className="flex flex-col px-6 mb-4">
          {error && (
            <div className="flex flex-row items-center gap-2">
              <FaInfoCircle className="text-primary" />
              <p className="text-xs text-primary whitespace-pre-line">
                {formatErrorMessage(error)}
              </p>
            </div>
          )}
        </div>
      }
    />
  );
};

const AvailabilityCalendar = ({
  isDateUnavailable,
}: {
  isDateUnavailable?: (date: DateValue) => boolean;
}) => {
  return (
    <I18nProvider locale="id">
      <RC
        classNames={{
          base: "w-full",
          content: "w-full",
          headerWrapper: "px-8",
          prevButton: "text-default-900",
          title: "text-default-900",
          nextButton: "text-default-900",
          gridHeaderRow: "justify-between md:justify-center px-8 md:px-0",
          gridBodyRow: "justify-between md:justify-center px-8 md:px-0",
          cellButton: "rounded-lg data-[unavailable=true]:no-underline",
        }}
        isReadOnly={true}
        isDateUnavailable={isDateUnavailable}
      />
    </I18nProvider>
  );
};

export { RentCalendar, RangeCalendar, CatalogCalendar, AvailabilityCalendar };
