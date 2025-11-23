import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, CreditCard, Wrench } from 'lucide-react';

/**
 * Map booking status from API to Vietnamese label
 */
export function getBookingStatusLabel(status: string): string {
  const normalized = (status || '').toUpperCase();
  switch (normalized) {
    case 'PENDING':
      return 'Chờ xác nhận';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'PAID':
      return 'Đã thanh toán';
    case 'ASSIGNED':
      return 'Đã phân công';
    case 'IN_PROGRESS':
      return 'Đang thực hiện';
    case 'MAINTENANCE_COMPLETE':
      return 'Hoàn thành';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'REJECTED':
      return 'Từ chối';
    default:
      return status;
  }
}

/**
 * Get status badge component for booking status
 * Using React.createElement to avoid JSX syntax in .ts file
 */
export function getBookingStatusBadge(status: string) {
  const normalized = (status || '').toUpperCase();
  switch (normalized) {
    case 'PENDING':
      return React.createElement(
        Badge,
        { variant: 'outline', className: 'gap-1' },
        React.createElement(AlertCircle, { className: 'w-3 h-3' }),
        'Chờ xác nhận'
      );
    case 'CONFIRMED':
      return React.createElement(
        Badge,
        { variant: 'default', className: 'gap-1' },
        React.createElement(CheckCircle2, { className: 'w-3 h-3' }),
        'Đã xác nhận'
      );
    case 'ASSIGNED':
      return React.createElement(
        Badge,
        { variant: 'default', className: 'bg-purple-600 hover:bg-purple-700 gap-1' },
        React.createElement(CheckCircle2, { className: 'w-3 h-3' }),
        'Đã phân công'
      );
    case 'PAID':
      return React.createElement(
        Badge,
        { variant: 'default', className: 'bg-blue-600 hover:bg-blue-700 gap-1' },
        React.createElement(CheckCircle2, { className: 'w-3 h-3' }),
        'Đã thanh toán'
      );
    case 'IN_PROGRESS':
      return React.createElement(
        Badge,
        { variant: 'secondary', className: 'gap-1' },
        React.createElement(Clock, { className: 'w-3 h-3' }),
        'Đang thực hiện'
      );
    case 'MAINTENANCE_COMPLETE':
      return React.createElement(
        Badge,
        { variant: 'default', className: 'bg-green-600 hover:bg-green-700 gap-1' },
        React.createElement(CheckCircle2, { className: 'w-3 h-3' }),
        'Hoàn thành'
      );
    case 'CANCELLED':
      return React.createElement(
        Badge,
        { variant: 'destructive', className: 'gap-1' },
        React.createElement(AlertCircle, { className: 'w-3 h-3' }),
        'Đã hủy'
      );
    case 'REJECTED':
      return React.createElement(
        Badge,
        { variant: 'destructive', className: 'gap-1' },
        React.createElement(AlertCircle, { className: 'w-3 h-3' }),
        'Từ chối'
      );
    default:
      return React.createElement(
        Badge,
        { variant: 'outline' },
        status || 'Không xác định'
      );
  }
}

/**
 * Get status info with icon and description
 */
export function getBookingStatusInfo(status: string) {
  const normalized = (status || '').toUpperCase();
  switch (normalized) {
    case 'PENDING':
      return {
        label: 'Chờ xác nhận',
        color: 'secondary' as const,
        icon: Clock,
        description: 'Đang chờ trung tâm xác nhận lịch hẹn'
      };
    case 'CONFIRMED':
      return {
        label: 'Đã xác nhận',
        color: 'default' as const,
        icon: CheckCircle2,
        description: 'Lịch hẹn đã được xác nhận, sẵn sàng thực hiện'
      };
    case 'PAID':
      return {
        label: 'Đã thanh toán',
        color: 'default' as const,
        icon: CreditCard,
        description: 'Đã thanh toán trước, sẵn sàng thực hiện dịch vụ'
      };
    case 'ASSIGNED':
      return {
        label: 'Đã phân công',
        color: 'default' as const,
        icon: CheckCircle2,
        description: 'Đã phân công kỹ thuật viên thực hiện'
      };
    case 'IN_PROGRESS':
      return {
        label: 'Đang thực hiện',
        color: 'default' as const,
        icon: Wrench,
        description: 'Dịch vụ đang được thực hiện'
      };
    case 'MAINTENANCE_COMPLETE':
      return {
        label: 'Hoàn thành',
        color: 'default' as const,
        icon: CheckCircle2,
        description: 'Dịch vụ đã hoàn thành'
      };
    case 'CANCELLED':
      return {
        label: 'Đã hủy',
        color: 'destructive' as const,
        icon: AlertCircle,
        description: 'Lịch hẹn đã bị hủy'
      };
    case 'REJECTED':
      return {
        label: 'Từ chối',
        color: 'destructive' as const,
        icon: AlertCircle,
        description: 'Lịch hẹn đã bị từ chối bởi trung tâm'
      };
    default:
      return {
        label: 'Không xác định',
        color: 'secondary' as const,
        icon: AlertCircle,
        description: 'Trạng thái không xác định'
      };
  }
}

/**
 * Map booking status from API to frontend status type
 */
export function mapBookingStatusToFrontend(status: string): 'pending' | 'confirmed' | 'assigned' | 'paid' | 'in_progress' | 'completed' | 'cancelled' | 'rejected' {
  const normalized = (status || '').toUpperCase();
  switch (normalized) {
    case 'PENDING':
      return 'pending';
    case 'CONFIRMED':
      return 'confirmed';
    case 'PAID':
      return 'paid';
    case 'ASSIGNED':
      return 'assigned';
    case 'IN_PROGRESS':
      return 'in_progress';
    case 'MAINTENANCE_COMPLETE':
      return 'completed';
    case 'CANCELLED':
      return 'cancelled';
    case 'REJECTED':
      return 'rejected';
    default:
      return 'pending';
  }
}

