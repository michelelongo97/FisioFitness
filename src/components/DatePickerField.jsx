import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DatePickerField({
  value,
  onChange,
  placeholder = "Seleziona data",
}) {
  const dateValue = value ? new Date(value + "T00:00:00") : null;

  const handleChange = (date) => {
    if (!date) {
      onChange("");
      return;
    }
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
  };

  return (
    <DatePicker
      selected={dateValue}
      onChange={handleChange}
      dateFormat="dd/MM/yyyy"
      placeholderText={placeholder}
      className="custom-date-input"
      calendarStartDay={1}
    />
  );
}
