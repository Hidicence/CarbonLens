import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  ScrollView
} from 'react-native';
import { X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

interface CustomDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  initialDate?: Date;
  minDate?: Date;
  maxDate?: Date;
}

const MONTHS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
];

const DAYS_OF_WEEK = ['日', '一', '二', '三', '四', '五', '六'];

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  visible,
  onClose,
  onSelect,
  initialDate = new Date(),
  minDate,
  maxDate
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);
  
  const yearScrollViewRef = useRef<ScrollView>(null);
  
  // Reset to initial date when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedDate(initialDate);
      setCurrentMonth(initialDate.getMonth());
      setCurrentYear(initialDate.getFullYear());
    }
  }, [visible, initialDate]);
  
  // Scroll to selected year when year picker is shown
  useEffect(() => {
    if (showYearPicker && yearScrollViewRef.current) {
      // Use a timeout to ensure the ScrollView has rendered
      setTimeout(() => {
        if (yearScrollViewRef.current) {
          // Calculate the position to scroll to (each year button is about 80px wide)
          const yearIndex = currentYear - (minDate ? minDate.getFullYear() : 1900);
          const scrollPosition = yearIndex * 80;
          yearScrollViewRef.current.scrollTo({ x: scrollPosition, animated: true });
        }
      }, 100);
    }
  }, [showYearPicker, currentYear, minDate]);
  
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const handleDayPress = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    
    // Check if date is within min/max range
    if (minDate && newDate < minDate) return;
    if (maxDate && newDate > maxDate) return;
    
    setSelectedDate(newDate);
  };
  
  const handleConfirm = () => {
    onSelect(selectedDate);
    onClose();
  };
  
  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    
    // Add empty spaces for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: 0, isCurrentMonth: false });
    }
    
    // Add days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const isDisabled = 
        (minDate && date < minDate) || 
        (maxDate && date > maxDate);
      
      days.push({ 
        day: i, 
        isCurrentMonth: true,
        isSelected: i === selectedDate.getDate() && 
                   currentMonth === selectedDate.getMonth() && 
                   currentYear === selectedDate.getFullYear(),
        isDisabled
      });
    }
    
    return days;
  };
  
  const renderYearPicker = () => {
    const startYear = Math.max(1900, minDate ? minDate.getFullYear() : 1900);
    const endYear = Math.min(2100, maxDate ? maxDate.getFullYear() : 2100);
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    
    return (
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <View style={styles.yearPickerModalOverlay}>
          <View style={[styles.yearPickerContainer, { backgroundColor: theme.card }]}>
            <View style={[styles.yearPickerHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.yearPickerTitle, { color: theme.text }]}>選擇年份</Text>
              <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={years}
              keyExtractor={(item) => item.toString()}
              numColumns={3}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.yearPickerItem,
                    item === currentYear && { 
                      backgroundColor: theme.primary + '20',
                      borderColor: theme.primary
                    }
                  ]}
                  onPress={() => {
                    setCurrentYear(item);
                    setShowYearPicker(false);
                  }}
                >
                  <Text 
                    style={[
                      styles.yearPickerItemText,
                      { color: theme.text },
                      item === currentYear && { color: theme.primary, fontWeight: 'bold' }
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.yearPickerList}
            />
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>選擇日期</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.yearSelector, { backgroundColor: theme.background + '80' }]}
            onPress={() => setShowYearPicker(true)}
          >
            <Text style={[styles.yearSelectorText, { color: theme.primary }]}>
              {currentYear} 年
            </Text>
          </TouchableOpacity>
          
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
              <ChevronLeft size={24} color={theme.text} />
            </TouchableOpacity>
            
            <Text style={[styles.monthYearText, { color: theme.text }]}>
              {MONTHS[currentMonth]}
            </Text>
            
            <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
              <ChevronRight size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.weekdaysContainer}>
            {DAYS_OF_WEEK.map((day, index) => (
              <Text 
                key={index} 
                style={[
                  styles.weekdayText, 
                  { color: theme.secondaryText }
                ]}
              >
                {day}
              </Text>
            ))}
          </View>
          
          <View style={styles.calendarContainer}>
            {generateCalendarDays().map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  !item.isCurrentMonth && styles.emptyDay,
                  item.isSelected && { 
                    backgroundColor: theme.primary,
                    borderColor: theme.primary
                  },
                  item.isDisabled && { opacity: 0.3 }
                ]}
                onPress={() => item.isCurrentMonth && !item.isDisabled && handleDayPress(item.day)}
                disabled={!item.isCurrentMonth || item.isDisabled}
              >
                {item.isCurrentMonth ? (
                  <Text 
                    style={[
                      styles.dayText,
                      { color: theme.text },
                      item.isSelected && { color: '#FFFFFF' }
                    ]}
                  >
                    {item.day}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity 
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>取消</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmButton, { backgroundColor: theme.primary }]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>確認</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {renderYearPicker()}
    </Modal>
  );
};

const { width } = Dimensions.get('window');
const DAY_BUTTON_SIZE = (width - 40) / 7;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  yearSelector: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 12,
  },
  yearSelectorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  monthButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  weekdayText: {
    width: DAY_BUTTON_SIZE,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dayButton: {
    width: DAY_BUTTON_SIZE,
    height: DAY_BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DAY_BUTTON_SIZE / 2,
    margin: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  yearPickerModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  yearPickerContainer: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  yearPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  yearPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  yearPickerList: {
    padding: 12,
  },
  yearPickerItem: {
    width: '33.33%',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    margin: 0,
  },
  yearPickerItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CustomDatePicker;