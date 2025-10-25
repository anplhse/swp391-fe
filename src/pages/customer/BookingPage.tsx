import { BookingForm } from '@/components/BookingForm';

// Mock services data - sẽ được thay thế bằng API call thực tế
const services: Service[] = [
  {
    id: '1',
    name: 'Bảo dưỡng định kỳ',
    description: 'Thay dầu, lọc dầu, kiểm tra hệ thống',
    price: 500000,
    duration: 120,
    compatibleVehicles: ['VF5', 'VF8', 'VF9', 'VFE34'],
    relatedParts: {
      'VF5': ['Dầu động cơ VF5', 'Lọc dầu VF5', 'Lọc gió VF5', 'Bugi VF5'],
      'VF8': ['Dầu động cơ VF8', 'Lọc dầu VF8', 'Lọc gió VF8', 'Bugi VF8'],
      'VF9': ['Dầu động cơ VF9', 'Lọc dầu VF9', 'Lọc gió VF9', 'Bugi VF9'],
      'VFE34': ['Dầu động cơ VFe34', 'Lọc dầu VFe34', 'Lọc gió VFe34', 'Bugi VFe34']
    },
    category: 'maintenance'
  },
  {
    id: '2',
    name: 'Kiểm tra phanh',
    description: 'Kiểm tra hệ thống phanh, thay thế nếu cần',
    price: 300000,
    duration: 60,
    compatibleVehicles: ['VF5', 'VF8', 'VF9', 'VFE34'],
    relatedParts: {
      'VF5': ['Má phanh VF5', 'Dầu phanh VF5', 'Đĩa phanh VF5', 'Piston phanh VF5'],
      'VF8': ['Má phanh VF8', 'Dầu phanh VF8', 'Đĩa phanh VF8', 'Piston phanh VF8'],
      'VF9': ['Má phanh VF9', 'Dầu phanh VF9', 'Đĩa phanh VF9', 'Piston phanh VF9'],
      'VFE34': ['Má phanh VFe34', 'Dầu phanh VFe34', 'Đĩa phanh VFe34', 'Piston phanh VFe34']
    },
    category: 'inspection'
  },
  {
    id: '3',
    name: 'Vệ sinh nội thất',
    description: 'Vệ sinh toàn bộ nội thất xe',
    price: 200000,
    duration: 90,
    compatibleVehicles: ['VF5', 'VF8', 'VF9', 'VFE34'],
    relatedParts: {
      'VF5': ['Chất tẩy rửa VF5', 'Khăn lau VF5', 'Bàn chải VF5', 'Máy hút bụi VF5'],
      'VF8': ['Chất tẩy rửa VF8', 'Khăn lau VF8', 'Bàn chải VF8', 'Máy hút bụi VF8'],
      'VF9': ['Chất tẩy rửa VF9', 'Khăn lau VF9', 'Bàn chải VF9', 'Máy hút bụi VF9'],
      'VFE34': ['Chất tẩy rửa VFe34', 'Khăn lau VFe34', 'Bàn chải VFe34', 'Máy hút bụi VFe34']
    },
    category: 'cleaning'
  },
  {
    id: '4',
    name: 'Kiểm tra điện',
    description: 'Kiểm tra hệ thống điện, ắc quy',
    price: 250000,
    duration: 60,
    compatibleVehicles: ['VF5', 'VF8', 'VF9', 'VFE34'],
    relatedParts: {
      'VF5': ['Ắc quy VF5', 'Cầu chì VF5', 'Dây điện VF5', 'Bộ điều khiển VF5'],
      'VF8': ['Ắc quy VF8', 'Cầu chì VF8', 'Dây điện VF8', 'Bộ điều khiển VF8'],
      'VF9': ['Ắc quy VF9', 'Cầu chì VF9', 'Dây điện VF9', 'Bộ điều khiển VF9'],
      'VFE34': ['Ắc quy VFe34', 'Cầu chì VFe34', 'Dây điện VFe34', 'Bộ điều khiển VFe34']
    },
    category: 'inspection'
  },
  {
    id: '5',
    name: 'Thay lốp',
    description: 'Thay lốp mới, cân bằng bánh xe',
    price: 800000,
    duration: 60,
    compatibleVehicles: ['VF5', 'VF8', 'VF9', 'VFE34'],
    relatedParts: {
      'VF5': ['Lốp xe VF5 (205/55R16)', 'Vành xe VF5', 'Van lốp VF5', 'Cân bằng bánh VF5'],
      'VF8': ['Lốp xe VF8 (235/60R18)', 'Vành xe VF8', 'Van lốp VF8', 'Cân bằng bánh VF8'],
      'VF9': ['Lốp xe VF9 (255/55R20)', 'Vành xe VF9', 'Van lốp VF9', 'Cân bằng bánh VF9'],
      'VFE34': ['Lốp xe VFe34 (225/50R17)', 'Vành xe VFe34', 'Van lốp VFe34', 'Cân bằng bánh VFe34']
    },
    category: 'repair'
  },
  {
    id: '6',
    name: 'Bảo dưỡng điều hòa',
    description: 'Vệ sinh, bảo dưỡng hệ thống điều hòa',
    price: 400000,
    duration: 120,
    compatibleVehicles: ['VF5', 'VF8', 'VF9', 'VFE34'],
    relatedParts: {
      'VF5': ['Gas lạnh VF5', 'Lọc gió điều hòa VF5', 'Dàn lạnh VF5', 'Dàn nóng VF5'],
      'VF8': ['Gas lạnh VF8', 'Lọc gió điều hòa VF8', 'Dàn lạnh VF8', 'Dàn nóng VF8'],
      'VF9': ['Gas lạnh VF9', 'Lọc gió điều hòa VF9', 'Dàn lạnh VF9', 'Dàn nóng VF9'],
      'VFE34': ['Gas lạnh VFe34', 'Lọc gió điều hòa VFe34', 'Dàn lạnh VFe34', 'Dàn nóng VFe34']
    },
    category: 'maintenance'
  },
  {
    id: '7',
    name: 'Kiểm tra động cơ',
    description: 'Kiểm tra toàn diện động cơ',
    price: 600000,
    duration: 180,
    compatibleVehicles: ['VF8', 'VF9', 'VFE34'],
    relatedParts: {
      'VF8': ['Cảm biến VF8', 'Bơm nhiên liệu VF8', 'Bộ lọc nhiên liệu VF8', 'Hệ thống làm mát VF8'],
      'VF9': ['Cảm biến VF9', 'Bơm nhiên liệu VF9', 'Bộ lọc nhiên liệu VF9', 'Hệ thống làm mát VF9'],
      'VFE34': ['Cảm biến VFe34', 'Bơm nhiên liệu VFe34', 'Bộ lọc nhiên liệu VFe34', 'Hệ thống làm mát VFe34']
    },
    category: 'inspection'
  },
  {
    id: '8',
    name: 'Vệ sinh ngoại thất',
    description: 'Rửa xe, đánh bóng, bảo dưỡng sơn',
    price: 350000,
    duration: 120,
    compatibleVehicles: ['VF5', 'VF8', 'VF9', 'VFE34'],
    relatedParts: {
      'VF5': ['Sáp đánh bóng VF5', 'Chất tẩy rửa VF5', 'Khăn lau VF5', 'Bàn chải rửa xe VF5'],
      'VF8': ['Sáp đánh bóng VF8', 'Chất tẩy rửa VF8', 'Khăn lau VF8', 'Bàn chải rửa xe VF8'],
      'VF9': ['Sáp đánh bóng VF9', 'Chất tẩy rửa VF9', 'Khăn lau VF9', 'Bàn chải rửa xe VF9'],
      'VFE34': ['Sáp đánh bóng VFe34', 'Chất tẩy rửa VFe34', 'Khăn lau VFe34', 'Bàn chải rửa xe VFe34']
    },
    category: 'cleaning'
  },
  {
    id: '9',
    name: 'Thay dầu hộp số',
    description: 'Thay dầu hộp số tự động',
    price: 450000,
    duration: 90,
    compatibleVehicles: ['VF8', 'VF9', 'VFE34'],
    relatedParts: {
      'VF8': ['Dầu hộp số VF8', 'Lọc dầu hộp số VF8', 'Gioăng phớt VF8'],
      'VF9': ['Dầu hộp số VF9', 'Lọc dầu hộp số VF9', 'Gioăng phớt VF9'],
      'VFE34': ['Dầu hộp số VFe34', 'Lọc dầu hộp số VFe34', 'Gioăng phớt VFe34']
    },
    category: 'maintenance'
  },
  {
    id: '10',
    name: 'Kiểm tra hệ thống treo',
    description: 'Kiểm tra giảm xóc, thanh chống',
    price: 300000,
    duration: 90,
    compatibleVehicles: ['VF5', 'VF8', 'VF9', 'VFE34'],
    relatedParts: {
      'VF5': ['Giảm xóc VF5', 'Thanh chống VF5', 'Bạc đạn VF5', 'Cao su giảm chấn VF5'],
      'VF8': ['Giảm xóc VF8', 'Thanh chống VF8', 'Bạc đạn VF8', 'Cao su giảm chấn VF8'],
      'VF9': ['Giảm xóc VF9', 'Thanh chống VF9', 'Bạc đạn VF9', 'Cao su giảm chấn VF9'],
      'VFE34': ['Giảm xóc VFe34', 'Thanh chống VFe34', 'Bạc đạn VFe34', 'Cao su giảm chấn VFe34']
    },
    category: 'inspection'
  },
  {
    id: '11',
    name: 'Bảo dưỡng phanh',
    description: 'Thay má phanh, kiểm tra dầu phanh',
    price: 500000,
    duration: 120,
    compatibleVehicles: ['VF5', 'VF8', 'VF9', 'VFE34'],
    relatedParts: {
      'VF5': ['Má phanh VF5', 'Dầu phanh VF5', 'Đĩa phanh VF5', 'Piston phanh VF5'],
      'VF8': ['Má phanh VF8', 'Dầu phanh VF8', 'Đĩa phanh VF8', 'Piston phanh VF8'],
      'VF9': ['Má phanh VF9', 'Dầu phanh VF9', 'Đĩa phanh VF9', 'Piston phanh VF9'],
      'VFE34': ['Má phanh VFe34', 'Dầu phanh VFe34', 'Đĩa phanh VFe34', 'Piston phanh VFe34']
    },
    category: 'maintenance'
  },
  {
    id: '12',
    name: 'Kiểm tra an toàn',
    description: 'Kiểm tra toàn diện an toàn xe',
    price: 400000,
    duration: 150,
    compatibleVehicles: ['VF5', 'VF8', 'VF9', 'VFE34'],
    relatedParts: {
      'VF5': ['Dây an toàn VF5', 'Túi khí VF5', 'Cảm biến va chạm VF5', 'Hệ thống ABS VF5'],
      'VF8': ['Dây an toàn VF8', 'Túi khí VF8', 'Cảm biến va chạm VF8', 'Hệ thống ABS VF8'],
      'VF9': ['Dây an toàn VF9', 'Túi khí VF9', 'Cảm biến va chạm VF9', 'Hệ thống ABS VF9'],
      'VFE34': ['Dây an toàn VFe34', 'Túi khí VFe34', 'Cảm biến va chạm VFe34', 'Hệ thống ABS VFe34']
    },
    category: 'inspection'
  }
];

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  compatibleVehicles: string[];
  relatedParts: Record<string, string[]>; // Model -> Parts mapping
  category: string;
}

export default function BookingPage() {
  return <BookingForm services={services} />;
}