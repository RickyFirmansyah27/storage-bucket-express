import { BaseResponse, Logger } from '../helper';
import { Context } from 'hono';
import { getUserByIdCard } from '../service/user-service';
import { attendancesToday, insertAttendance, addTimeOutAttendance, getAllAttendances } from '../service/attendance-service';

export const insertAttendanceHandler = async (c: Context) => {
  try {
    const body = await c.req.json<{
      idCard: string;
      date: string;
    }>();

    const { idCard, date } = body;

    // Validasi input
    if (!idCard || !date) {
      return BaseResponse(c, 'RFID CARD, and DATE are required', 'badRequest');
    }

    const [user] = await getUserByIdCard(idCard);
    if (!user) {
      return BaseResponse(c, 'User not found', 'notFound');
    }

    const today = new Date(date);
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendances = await attendancesToday(user.id, today.toISOString(), tomorrow.toISOString());

    if (attendances.length === 0) {
      // Belum ada → create baru dengan timeIn  
      const newAttendance = await insertAttendance(user.id, idCard, user.name, today.toISOString(), new Date().toISOString());
      return BaseResponse(c, 'Attendance recorded (time-in)', 'created', newAttendance);

    } else if (attendances.length === 1) {
      const attendance = attendances[0];

      if (attendance.timeOut) {
        return BaseResponse(c, 'Attendance already completed for today', 'badRequest');
      }

      const insertTimeOut = await addTimeOutAttendance(attendance.id);
      return BaseResponse(c, 'Attendance recorded (time-out)', 'ok', [insertTimeOut]);

    } else {
      return BaseResponse(c, 'Maximum attendance reached for today', 'badRequest');
    }

  } catch (err: any) {
    return BaseResponse(c, err.message || 'Error recording attendance', 'internalServerError');
  }
};

export const getAttendances = async (c: Context) => {
  try {
    const record = await getAllAttendances();
    console.log(record);
    Logger.info('AttendanceController | getAttendances', record);
    return BaseResponse(c, 'Attendance fetched successfully', 'success', record)
  } catch (error) {
    Logger.error('AttendanceController | getAttendances', error);
    return BaseResponse(c, 'Error fetching attendances', 'internalServerError');
  }
};
