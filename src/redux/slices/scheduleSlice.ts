import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as scheduleApi from '../../api/scheduleApi';
import { 
  Schedule, 
  ScheduleState, 
  ScheduleListResponse, 
  SingleScheduleResponse,
  UpdateScheduleArgs,
  WeeklyScheduleArgs 
} from '../../types';

// Initial state
const initialState: ScheduleState = {
  schedules: [],
  weeklySchedule: [],
  selectedDepartment: null,
  loading: false,
  error: null,
  success: false,
};

// Async thunks
export const fetchAllSchedules = createAsyncThunk<
  ScheduleListResponse,
  void,
  { rejectValue: string }
>(
  'schedule/fetchAllSchedules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.getAllSchedules();
      return response as ScheduleListResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchSchedulesByDepartment = createAsyncThunk<
  ScheduleListResponse,
  string,
  { rejectValue: string }
>(
  'schedule/fetchSchedulesByDepartment',
  async (departmentId, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.getSchedulesByDepartment(departmentId);
      return response as ScheduleListResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createNewSchedule = createAsyncThunk<
  SingleScheduleResponse,
  Partial<Schedule>,
  { rejectValue: string }
>(
  'schedule/createNewSchedule',
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.createSchedule(scheduleData);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to create schedule');
      }
      return response as SingleScheduleResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateExistingSchedule = createAsyncThunk<
  SingleScheduleResponse,
  UpdateScheduleArgs,
  { rejectValue: string }
>(
  'schedule/updateExistingSchedule',
  async ({ scheduleId, scheduleData }, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.updateSchedule(scheduleId, scheduleData);
      return response as SingleScheduleResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteExistingSchedule = createAsyncThunk<
  { scheduleId: string; success: boolean; message?: string },
  string,
  { rejectValue: string }
>(
  'schedule/deleteExistingSchedule',
  async (scheduleId, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.deleteSchedule(scheduleId);
      return { scheduleId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchWeeklySchedule = createAsyncThunk<
  ScheduleListResponse,
  WeeklyScheduleArgs,
  { rejectValue: string }
>(
  'schedule/fetchWeeklySchedule',
  async ({ departmentId, weekStart }, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.getWeeklySchedule({departmentId, weekStart});
      return response as ScheduleListResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
    },
    clearScheduleError: (state) => {
      state.error = null;
    },
    clearScheduleSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all schedules
      .addCase(fetchAllSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSchedules.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.schedules = action.payload.data.map((schedule) => ({
            ...schedule,
            id: schedule._id || schedule.id,
          }));
        } else {
          state.schedules = [];
        }
        state.success = true;
      })
      .addCase(fetchAllSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.schedules = [];
      })
      // Fetch schedules by department
      .addCase(fetchSchedulesByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedulesByDepartment.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.schedules = action.payload.data.map((schedule) => ({
            ...schedule,
            id: schedule._id || schedule.id,
          }));
        } else {
          state.schedules = [];
        }
        state.success = true;
      })
      .addCase(fetchSchedulesByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create new schedule
      .addCase(createNewSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewSchedule.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          const newSchedule = {
            ...action.payload.data,
            id: action.payload.data._id || action.payload.data.id,
          };
          state.schedules = [...state.schedules, newSchedule];
        }
        state.success = true;
      })
      .addCase(createNewSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update schedule
      .addCase(updateExistingSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingSchedule.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          const updatedSchedule = {
            ...action.payload.data,
            id: action.payload.data._id || action.payload.data.id,
          };
          const index = state.schedules.findIndex(
            (schedule) => schedule.id === updatedSchedule.id
          );
          if (index !== -1) {
            state.schedules[index] = updatedSchedule;
          }
        }
        state.success = true;
      })
      .addCase(updateExistingSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete schedule
      .addCase(deleteExistingSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingSchedule.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.schedules = state.schedules.filter(
            (schedule) => schedule.id !== action.payload.scheduleId
          );
        }
        state.success = true;
      })
      .addCase(deleteExistingSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch weekly schedule
      .addCase(fetchWeeklySchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeklySchedule.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.weeklySchedule = action.payload.data.map((schedule) => ({
            ...schedule,
            id: schedule._id || schedule.id,
          }));
        } else {
          state.weeklySchedule = [];
        }
        state.success = true;
      })
      .addCase(fetchWeeklySchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedDepartment, clearScheduleError, clearScheduleSuccess } =
  scheduleSlice.actions;

export default scheduleSlice.reducer;
