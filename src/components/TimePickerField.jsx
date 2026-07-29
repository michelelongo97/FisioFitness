import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TimePickerField({
  value,
  onChange,
  placeholder = "Seleziona ora",
}) {
  const timeValue = value ? new Date(`2000-01-01T${value}`) : null;

  const handleChange = (date) => {
    if (!date) {
      onChange("");
      return;
    }
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    onChange(`${hh}:${mm}`);
  };

  return (
    <DatePicker
      selected={timeValue}
      onChange={handleChange}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={15}
      timeCaption="Ora"
      dateFormat="HH:mm"
      placeholderText={placeholder}
      className="custom-date-input"
    />
  );
}
