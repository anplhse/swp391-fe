import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { showApiErrorToast } from '@/lib/responseHandler';
import { Eye, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type VehicleModel = {
  id: number;
  brandName: string;
  modelName: string;
  dimensions?: string;
  seats?: number;
  batteryCapacityKwh?: number;
  rangeKm?: number;
  chargingTimeHours?: number;
  motorPowerKw?: number;
  weightKg?: number;
  imageUrl?: string;
  status: string;
  createdAt?: string;
};

export default function VehicleModelsPage() {
  const { toast } = useToast();
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [modelEnumValues, setModelEnumValues] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [modelDetail, setModelDetail] = useState<VehicleModel | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<VehicleModel | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newModel, setNewModel] = useState<Partial<VehicleModel>>({
    brandName: '',
    modelName: '',
    dimensions: '',
    seats: undefined,
    batteryCapacityKwh: undefined,
    rangeKm: undefined,
    chargingTimeHours: undefined,
    motorPowerKw: undefined,
    weightKg: undefined,
    imageUrl: '',
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiClient.getVehicleModels();
        if (!mounted) return;
        setModels(data);
      } catch (e) {
        console.error('Failed to load vehicle models', e);
        showApiErrorToast(e, toast, 'Không tải được danh sách model');
      }
    })();
    return () => { mounted = false; };
  }, [toast]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const enumData = await apiClient.getVehicleModelEnum();
        if (!mounted) return;
        // Lọc bỏ giá trị "string" nếu có
        const values = enumData.enumValue.filter(v => v !== 'string');
        setModelEnumValues(values);
      } catch (e) {
        console.error('Failed to load vehicle model enum', e);
        // Không hiển thị toast vì đây không phải lỗi nghiêm trọng
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return models.filter(m =>
      (statusFilter === 'ALL' ? true : m.status === statusFilter) &&
      (
        !keyword ||
        m.brandName.toLowerCase().includes(keyword) ||
        m.modelName.toLowerCase().includes(keyword)
      )
    );
  }, [models, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + pageSize);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case 'INACTIVE':
        return <Badge variant="secondary">Không hoạt động</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewDetail = async (modelId: number) => {
    setSelectedModelId(modelId);
    setIsDetailDialogOpen(true);
    setIsLoadingDetail(true);
    setModelDetail(null);

    try {
      const detail = await apiClient.getVehicleModelById(modelId);
      setModelDetail(detail);
    } catch (error) {
      console.error('Failed to load model detail', error);
      showApiErrorToast(error, toast, 'Không tải được chi tiết model');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleEdit = (model: VehicleModel) => {
    setEditingModel({ ...model });
    setIsEditDialogOpen(true);
    setIsDetailDialogOpen(false);
  };

  const handleAddNew = () => {
    setNewModel({
      brandName: '',
      modelName: '',
      dimensions: '',
      seats: undefined,
      batteryCapacityKwh: undefined,
      rangeKm: undefined,
      chargingTimeHours: undefined,
      motorPowerKw: undefined,
      weightKg: undefined,
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveAdd = async () => {
    if (!newModel.brandName || !newModel.modelName) {
      toast({
        title: 'Thông tin không đầy đủ',
        description: 'Vui lòng nhập Hãng và Model.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload: {
        brandName: string;
        modelName: string;
        dimensions?: string;
        seats?: number;
        batteryCapacityKwh?: number;
        rangeKm?: number;
        chargingTimeHours?: number;
        motorPowerKw?: number;
        weightKg?: number;
        imageUrl?: string;
      } = {
        brandName: newModel.brandName,
        modelName: newModel.modelName,
      };

      if (newModel.dimensions) payload.dimensions = newModel.dimensions;
      if (newModel.seats !== undefined) payload.seats = newModel.seats;
      if (newModel.batteryCapacityKwh !== undefined) payload.batteryCapacityKwh = newModel.batteryCapacityKwh;
      if (newModel.rangeKm !== undefined) payload.rangeKm = newModel.rangeKm;
      if (newModel.chargingTimeHours !== undefined) payload.chargingTimeHours = newModel.chargingTimeHours;
      if (newModel.motorPowerKw !== undefined) payload.motorPowerKw = newModel.motorPowerKw;
      if (newModel.weightKg !== undefined) payload.weightKg = newModel.weightKg;
      if (newModel.imageUrl) payload.imageUrl = newModel.imageUrl;

      const created = await apiClient.createVehicleModel(payload);

      // Thêm vào danh sách
      setModels([...models, created]);

      toast({
        title: 'Thêm mới thành công',
        description: 'Model mới đã được thêm vào hệ thống.',
      });

      setIsAddDialogOpen(false);
      setNewModel({
        brandName: '',
        modelName: '',
        dimensions: '',
        seats: undefined,
        batteryCapacityKwh: undefined,
        rangeKm: undefined,
        chargingTimeHours: undefined,
        motorPowerKw: undefined,
        weightKg: undefined,
        imageUrl: '',
      });
    } catch (error) {
      console.error('Failed to create model', error);
      showApiErrorToast(error, toast, 'Không thể thêm model. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingModel) return;

    setIsSaving(true);
    try {
      const payload: Partial<{
        brandName: string;
        modelName: string;
        dimensions?: string;
        seats?: number;
        batteryCapacityKwh?: number;
        rangeKm?: number;
        chargingTimeHours?: number;
        motorPowerKw?: number;
        weightKg?: number;
        imageUrl?: string;
        status?: string;
      }> = {};

      // Chỉ gửi các trường đã thay đổi
      if (editingModel.brandName) payload.brandName = editingModel.brandName;
      if (editingModel.modelName) payload.modelName = editingModel.modelName;
      if (editingModel.dimensions !== undefined) payload.dimensions = editingModel.dimensions;
      if (editingModel.seats !== undefined) payload.seats = editingModel.seats;
      if (editingModel.batteryCapacityKwh !== undefined) payload.batteryCapacityKwh = editingModel.batteryCapacityKwh;
      if (editingModel.rangeKm !== undefined) payload.rangeKm = editingModel.rangeKm;
      if (editingModel.chargingTimeHours !== undefined) payload.chargingTimeHours = editingModel.chargingTimeHours;
      if (editingModel.motorPowerKw !== undefined) payload.motorPowerKw = editingModel.motorPowerKw;
      if (editingModel.weightKg !== undefined) payload.weightKg = editingModel.weightKg;
      if (editingModel.imageUrl !== undefined) payload.imageUrl = editingModel.imageUrl;
      if (editingModel.status) payload.status = editingModel.status;

      const updated = await apiClient.updateVehicleModel(editingModel.id, payload);

      // Cập nhật local state
      setModels(models.map(m => m.id === editingModel.id ? updated : m));

      toast({
        title: 'Cập nhật thành công',
        description: 'Thông tin model đã được cập nhật.',
      });

      setIsEditDialogOpen(false);
      setEditingModel(null);
    } catch (error) {
      console.error('Failed to update model', error);
      showApiErrorToast(error, toast, 'Không thể cập nhật model. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm model/brand..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as 'ALL' | 'ACTIVE' | 'INACTIVE'); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">ACTIVE</SelectItem>
              <SelectItem value="INACTIVE">INACTIVE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm mới
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>Trước</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>Sau</Button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hãng</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Kích thước</TableHead>
              <TableHead>Chỗ ngồi</TableHead>
              <TableHead>Pin (kWh)</TableHead>
              <TableHead>Tầm hoạt động (km)</TableHead>
              <TableHead>Sạc (h)</TableHead>
              <TableHead>Công suất (kW)</TableHead>
              <TableHead>Khối lượng (kg)</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                  Không có model phù hợp
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map(m => (
                <TableRow key={m.id}>
                  <TableCell>{m.brandName}</TableCell>
                  <TableCell>{m.modelName}</TableCell>
                  <TableCell>{getStatusBadge(m.status)}</TableCell>
                  <TableCell>{m.dimensions || '—'}</TableCell>
                  <TableCell>{m.seats ?? '—'}</TableCell>
                  <TableCell>{m.batteryCapacityKwh ?? '—'}</TableCell>
                  <TableCell>{m.rangeKm ?? '—'}</TableCell>
                  <TableCell>{m.chargingTimeHours ?? '—'}</TableCell>
                  <TableCell>{m.motorPowerKw ?? '—'}</TableCell>
                  <TableCell>{m.weightKg ?? '—'}</TableCell>
                  <TableCell>{m.createdAt ? new Date(m.createdAt).toLocaleDateString('vi-VN') : '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetail(m.id)}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết Model</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về model xe
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="py-8 text-center text-muted-foreground">
              Đang tải chi tiết...
            </div>
          ) : modelDetail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">ID</label>
                  <p className="text-sm font-medium">{modelDetail.id}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Hãng</label>
                  <p className="text-sm font-medium">{modelDetail.brandName}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Model</label>
                  <p className="text-sm font-medium">{modelDetail.modelName}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
                  <div>{getStatusBadge(modelDetail.status)}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Kích thước</label>
                  <p className="text-sm font-medium">{modelDetail.dimensions || '—'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Chỗ ngồi</label>
                  <p className="text-sm font-medium">{modelDetail.seats ?? '—'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Pin (kWh)</label>
                  <p className="text-sm font-medium">{modelDetail.batteryCapacityKwh ?? '—'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Tầm hoạt động (km)</label>
                  <p className="text-sm font-medium">{modelDetail.rangeKm ?? '—'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Thời gian sạc (h)</label>
                  <p className="text-sm font-medium">{modelDetail.chargingTimeHours ?? '—'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Công suất (kW)</label>
                  <p className="text-sm font-medium">{modelDetail.motorPowerKw ?? '—'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Khối lượng (kg)</label>
                  <p className="text-sm font-medium">{modelDetail.weightKg ?? '—'}</p>
                </div>
                {modelDetail.imageUrl && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Hình ảnh</label>
                    <div className="mt-2">
                      <img
                        src={modelDetail.imageUrl}
                        alt={modelDetail.modelName}
                        className="w-full max-w-md h-auto rounded-lg border border-border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Ngày tạo</label>
                  <p className="text-sm font-medium">
                    {modelDetail.createdAt ? new Date(modelDetail.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Không tìm thấy thông tin model
            </div>
          )}
          {modelDetail && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailDialogOpen(false);
                  handleEdit(modelDetail);
                }}
              >
                Chỉnh sửa
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Model</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin model xe. Bạn có thể thay đổi một hoặc nhiều trường.
            </DialogDescription>
          </DialogHeader>
          {editingModel ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-brandName">Hãng *</Label>
                  <Input
                    id="edit-brandName"
                    value={editingModel.brandName}
                    onChange={(e) => setEditingModel({ ...editingModel, brandName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-modelName">Model *</Label>
                  {modelEnumValues.length > 0 ? (
                    <Select
                      value={editingModel.modelName}
                      onValueChange={(value) => setEditingModel({ ...editingModel, modelName: value })}
                    >
                      <SelectTrigger id="edit-modelName">
                        <SelectValue placeholder="Chọn model" />
                      </SelectTrigger>
                      <SelectContent>
                        {modelEnumValues.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="edit-modelName"
                      value={editingModel.modelName}
                      onChange={(e) => setEditingModel({ ...editingModel, modelName: e.target.value })}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dimensions">Kích thước</Label>
                  <Input
                    id="edit-dimensions"
                    value={editingModel.dimensions || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, dimensions: e.target.value })}
                    placeholder="VD: 3190x1675x1600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-seats">Chỗ ngồi</Label>
                  <Input
                    id="edit-seats"
                    type="number"
                    min={1}
                    value={editingModel.seats ?? ''}
                    onChange={(e) => setEditingModel({ ...editingModel, seats: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-batteryCapacityKwh">Pin (kWh)</Label>
                  <Input
                    id="edit-batteryCapacityKwh"
                    type="number"
                    step="0.01"
                    min={0}
                    value={editingModel.batteryCapacityKwh ?? ''}
                    onChange={(e) => setEditingModel({ ...editingModel, batteryCapacityKwh: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-rangeKm">Tầm hoạt động (km)</Label>
                  <Input
                    id="edit-rangeKm"
                    type="number"
                    min={0}
                    value={editingModel.rangeKm ?? ''}
                    onChange={(e) => setEditingModel({ ...editingModel, rangeKm: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-chargingTimeHours">Thời gian sạc (h)</Label>
                  <Input
                    id="edit-chargingTimeHours"
                    type="number"
                    step="0.1"
                    min={0}
                    value={editingModel.chargingTimeHours ?? ''}
                    onChange={(e) => setEditingModel({ ...editingModel, chargingTimeHours: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-motorPowerKw">Công suất (kW)</Label>
                  <Input
                    id="edit-motorPowerKw"
                    type="number"
                    min={0}
                    value={editingModel.motorPowerKw ?? ''}
                    onChange={(e) => setEditingModel({ ...editingModel, motorPowerKw: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-weightKg">Khối lượng (kg)</Label>
                  <Input
                    id="edit-weightKg"
                    type="number"
                    min={0}
                    value={editingModel.weightKg ?? ''}
                    onChange={(e) => setEditingModel({ ...editingModel, weightKg: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-imageUrl">URL hình ảnh</Label>
                  <Input
                    id="edit-imageUrl"
                    type="url"
                    value={editingModel.imageUrl || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  {editingModel.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={editingModel.imageUrl}
                        alt="Preview"
                        className="w-full max-w-md h-auto rounded-lg border border-border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Trạng thái</Label>
                  <Select
                    value={editingModel.status}
                    onValueChange={(value) => setEditingModel({ ...editingModel, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingModel(null);
              }}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm Model Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin model xe mới. Các trường có dấu * là bắt buộc.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-brandName">Hãng *</Label>
                <Input
                  id="add-brandName"
                  value={newModel.brandName || ''}
                  onChange={(e) => setNewModel({ ...newModel, brandName: e.target.value })}
                  placeholder="VD: VinFast"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-modelName">Model *</Label>
                {modelEnumValues.length > 0 ? (
                  <Select
                    value={newModel.modelName || ''}
                    onValueChange={(value) => setNewModel({ ...newModel, modelName: value })}
                  >
                    <SelectTrigger id="add-modelName">
                      <SelectValue placeholder="Chọn model" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelEnumValues.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="add-modelName"
                    value={newModel.modelName || ''}
                    onChange={(e) => setNewModel({ ...newModel, modelName: e.target.value })}
                    placeholder="VD: VF 3"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-dimensions">Kích thước</Label>
                <Input
                  id="add-dimensions"
                  value={newModel.dimensions || ''}
                  onChange={(e) => setNewModel({ ...newModel, dimensions: e.target.value })}
                  placeholder="VD: 3190x1675x1600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-seats">Chỗ ngồi</Label>
                <Input
                  id="add-seats"
                  type="number"
                  min={1}
                  value={newModel.seats ?? ''}
                  onChange={(e) => setNewModel({ ...newModel, seats: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-batteryCapacityKwh">Pin (kWh)</Label>
                <Input
                  id="add-batteryCapacityKwh"
                  type="number"
                  step="0.01"
                  min={0}
                  value={newModel.batteryCapacityKwh ?? ''}
                  onChange={(e) => setNewModel({ ...newModel, batteryCapacityKwh: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-rangeKm">Tầm hoạt động (km)</Label>
                <Input
                  id="add-rangeKm"
                  type="number"
                  min={0}
                  value={newModel.rangeKm ?? ''}
                  onChange={(e) => setNewModel({ ...newModel, rangeKm: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-chargingTimeHours">Thời gian sạc (h)</Label>
                <Input
                  id="add-chargingTimeHours"
                  type="number"
                  step="0.1"
                  min={0}
                  value={newModel.chargingTimeHours ?? ''}
                  onChange={(e) => setNewModel({ ...newModel, chargingTimeHours: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-motorPowerKw">Công suất (kW)</Label>
                <Input
                  id="add-motorPowerKw"
                  type="number"
                  min={0}
                  value={newModel.motorPowerKw ?? ''}
                  onChange={(e) => setNewModel({ ...newModel, motorPowerKw: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-weightKg">Khối lượng (kg)</Label>
                <Input
                  id="add-weightKg"
                  type="number"
                  min={0}
                  value={newModel.weightKg ?? ''}
                  onChange={(e) => setNewModel({ ...newModel, weightKg: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="add-imageUrl">URL hình ảnh</Label>
                <Input
                  id="add-imageUrl"
                  type="url"
                  value={newModel.imageUrl || ''}
                  onChange={(e) => setNewModel({ ...newModel, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {newModel.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={newModel.imageUrl}
                      alt="Preview"
                      className="w-full max-w-md h-auto rounded-lg border border-border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewModel({
                  brandName: '',
                  modelName: '',
                  dimensions: '',
                  seats: undefined,
                  batteryCapacityKwh: undefined,
                  rangeKm: undefined,
                  chargingTimeHours: undefined,
                  motorPowerKw: undefined,
                  weightKg: undefined,
                });
              }}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveAdd} disabled={isSaving}>
              {isSaving ? 'Đang thêm...' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

