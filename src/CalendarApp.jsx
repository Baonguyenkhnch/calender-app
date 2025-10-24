import React, { useState, useCallback } from "react";
import "./CalendarApp.css";

const CalendarApp = () => {
  const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthOfYear = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const currentDate = new Date(2025, 8, 22); // 22/09/2025
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventTime, setEventTime] = useState({ hour: "09", minutes: "00" });
  const [eventText, setEventText] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);

  const dayInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = useCallback(() => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 0) {
        setCurrentYear((prevYear) => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 11) {
        setCurrentYear((prevYear) => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  }, []);

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleDayClick = useCallback(
    (day) => {
      const clickDate = new Date(currentYear, currentMonth, day);
      const today = new Date();
      if (clickDate >= today || isSameDay(clickDate, today)) {
        setSelectedDate(clickDate);
        setShowEventPopup(true);
        setEventTime({ hour: "09", minutes: "00" });
        setEventText("");
        setEditingEvent(null);
      }
    },
    [currentYear, currentMonth]
  );

  const handleCloseEventPopup = () => {
    setShowEventPopup(false);
    setEditingEvent(null);
  };

  const handleEventSubmit = () => {
    if (!eventText.trim()) {
      alert("Vui lòng nhập nội dung sự kiện!");
      return;
    }

    const hour = parseInt(eventTime.hour);
    const minutes = parseInt(eventTime.minutes);
    if (
      isNaN(hour) ||
      isNaN(minutes) ||
      hour < 0 ||
      hour > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      alert("Vui lòng nhập giờ (0-23) và phút (0-59) hợp lệ!");
      return;
    }

    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now(),
      date: new Date(selectedDate),
      time: `${hour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`,
      text: eventText.trim(),
    };

    let updatedEvents;
    if (editingEvent) {
      updatedEvents = events.map((event) =>
        event.id === editingEvent.id ? newEvent : event
      );
    } else {
      const isDuplicate = events.some(
        (event) =>
          isSameDay(event.date, newEvent.date) &&
          event.time === newEvent.time &&
          event.text === newEvent.text
      );
      if (isDuplicate) {
        alert("Sự kiện này đã tồn tại!");
        return;
      }
      updatedEvents = [...events, newEvent];
    }

    updatedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    setEvents(updatedEvents);
    setEventTime({ hour: "09", minutes: "00" });
    setEventText("");
    setShowEventPopup(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter((event) => event.id !== eventId));
  };

  // Tăng giảm giờ phút
  const incrementHour = () => {
    setEventTime((prev) => ({
      ...prev,
      hour: String((parseInt(prev.hour) + 1) % 24).padStart(2, "0"),
    }));
  };

  const decrementHour = () => {
    setEventTime((prev) => ({
      ...prev,
      hour: String((parseInt(prev.hour) + 23) % 24).padStart(2, "0"),
    }));
  };

  const incrementMinute = () => {
    setEventTime((prev) => ({
      ...prev,
      minutes: String((parseInt(prev.minutes) + 1) % 60).padStart(2, "0"),
    }));
  };

  const decrementMinute = () => {
    setEventTime((prev) => ({
      ...prev,
      minutes: String((parseInt(prev.minutes) + 59) % 60).padStart(2, "0"),
    }));
  };

  return (
    <div className="calendar-app">
      <div className="main-container">
        {/* Left Calendar Panel */}
        <div className="calendar-panel">
          <div className="calendar-header">
            <h1 className="heading">CALENDAR</h1>
          </div>

          <div className="month-navigation">
            <div className="month-display">
              <span className="month">{monthOfYear[currentMonth]}, </span>
              <span className="year">{currentYear}</span>
            </div>
            <div className="navigation">
              <button className="nav-btn" onClick={prevMonth}>
                <i className="bx bx-chevron-left"></i>
              </button>
              <button className="nav-btn" onClick={nextMonth}>
                <i className="bx bx-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="weekdays">
            {dayOfWeek.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="days-grid">
            {[...Array(firstDayOfMonth).keys()].map((_, index) => (
              <span key={`empty-${index}`} className="empty-day" />
            ))}

            {[...Array(dayInMonth).keys()].map((day) => {
              const dayNum = day + 1;
              const isToday =
                dayNum === currentDate.getDate() &&
                currentMonth === currentDate.getMonth() &&
                currentYear === currentDate.getFullYear();

              return (
                <span
                  key={dayNum}
                  className={`day ${isToday ? "current-day" : ""}`}
                  onClick={() => handleDayClick(dayNum)}
                >
                  {dayNum}
                </span>
              );
            })}
          </div>
        </div>

        {/* Right Events Panel */}
        <div className="events-panel">
          {showEventPopup && (
            <div
              className="event-popup-overlay"
              onClick={handleCloseEventPopup}
            >
              <div
                className="event-popup"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="popup-header">
                  <h3>{editingEvent ? "Chỉnh sửa sự kiện" : "Thêm sự kiện mới"}</h3>
                  <button className="close-btn" onClick={handleCloseEventPopup}>
                    <i className="bx bx-x"></i>
                  </button>
                </div>

                <div className="popup-body">
                  <div className="event-date-display">
                    Ngày:{" "}
                    <span className="selected-date">
                      {selectedDate.toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="form-group">
                    <label>Giờ:</label>
                    <div className="form-group-time">
                      <div className="time-control">
                        <button onClick={incrementHour}>▲</button>
                        <input
                          type="text"
                          className="time-input"
                          value={eventTime.hour}
                          readOnly
                        />
                        <button onClick={decrementHour}>▼</button>
                      </div>
                      <span className="time-separator">:</span>
                      <div className="time-control">
                        <button onClick={incrementMinute}>▲</button>
                        <input
                          type="text"
                          className="time-input"
                          value={eventTime.minutes}
                          readOnly
                        />
                        <button onClick={decrementMinute}>▼</button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Nội dung:</label>
                    <div className="textarea-container">
                      <textarea
                        className="event-textarea"
                        value={eventText}
                        maxLength={60}
                        onChange={(e) => setEventText(e.target.value)}
                        placeholder="Nhập nội dung sự kiện (tối đa 60 ký tự)..."
                      />
                      <div className="char-count">
                        {eventText.length}/60
                      </div>
                    </div>
                  </div>

                  <button
                    className="add-event-btn"
                    onClick={handleEventSubmit}
                    disabled={!eventText.trim()}
                  >
                    {editingEvent ? "Cập nhật sự kiện" : "Lưu sự kiện"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Danh sách sự kiện */}
          <div className="event-list">
            <h3>Sự kiện đã lưu ({events.length})</h3>
            {events.length === 0 ? (
              <p className="no-events">Chưa có sự kiện nào</p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-info">
                    <div className="event-date">
                      {monthOfYear[event.date.getMonth()]}{" "}
                      {event.date.getDate()}, {event.date.getFullYear()}
                    </div>
                    <div className="event-time">{event.time}</div>
                  </div>
                  <div className="event-title">{event.text}</div>
                  <div className="event-actions">
                    <i
                      className="bx bx-trash"
                      onClick={() => handleDeleteEvent(event.id)}
                      title="Xóa sự kiện"
                    ></i>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarApp;
