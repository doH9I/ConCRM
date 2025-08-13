import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  InputAdornment,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Inventory,
  Category,
  Upload,
  Download,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialsApi } from '../../services/materialsApi';
import { Material } from '../../types';

const MaterialsList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Запросы данных
  const { data: materialsResponse, isLoading, error } = useQuery({
    queryKey: ['materials', searchQuery, categoryFilter, statusFilter, page],
    queryFn: () => materialsApi.getMaterials(page, 20, {
      search: searchQuery,
      category: categoryFilter,
      status: statusFilter,
    }),
  });

  const { data: lowStockResponse } = useQuery({
    queryKey: ['materials-low-stock'],
    queryFn: () => materialsApi.getLowStockMaterials(),
  });

  // Мутации
  const deleteMaterialMutation = useMutation({
    mutationFn: materialsApi.deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      handleMenuClose();
    },
  });

  const importMaterialsMutation = useMutation({
    mutationFn: materialsApi.importMaterials,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      setImportDialogOpen(false);
      setImportFile(null);
    },
  });

  const materials = materialsResponse?.data || [];
  const lowStockMaterials = lowStockResponse?.data || [];
  const categories = [...new Set(materials.map(mat => mat.category).filter(Boolean))];

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, materialId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedMaterial(materialId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMaterial(null);
  };

  const handleViewMaterial = () => {
    if (selectedMaterial) {
      navigate(`/materials/detail/${selectedMaterial}`);
    }
    handleMenuClose();
  };

  const handleEditMaterial = () => {
    if (selectedMaterial) {
      navigate(`/materials/edit/${selectedMaterial}`);
    }
    handleMenuClose();
  };

  const handleDeleteMaterial = () => {
    if (selectedMaterial) {
      deleteMaterialMutation.mutate(selectedMaterial);
    }
  };

  const handleExportBalances = async () => {
    try {
      const blob = await materialsApi.exportBalances();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'material_balances.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
    }
  };

  const handleImportMaterials = () => {
    if (importFile) {
      importMaterialsMutation.mutate(importFile);
    }
  };

  const getStockStatusColor = (material: Material) => {
    if (material.stock_quantity <= (material.min_stock || 0)) {
      return 'error';
    } else if (material.stock_quantity <= (material.min_stock || 0) * 1.5) {
      return 'warning';
    }
    return 'success';
  };

  const getStockStatusLabel = (material: Material) => {
    if (material.stock_quantity <= (material.min_stock || 0)) {
      return 'Критический';
    } else if (material.stock_quantity <= (material.min_stock || 0) * 1.5) {
      return 'Низкий';
    }
    return 'Нормальный';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Ошибка загрузки материалов: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Материалы
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setImportDialogOpen(true)}
          >
            Импорт
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportBalances}
          >
            Экспорт остатков
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/materials/create')}
          >
            Добавить материал
          </Button>
        </Box>
      </Box>

      {/* Предупреждения о низких остатках */}
      {lowStockMaterials.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Материалы с низкими остатками ({lowStockMaterials.length}):
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {lowStockMaterials.slice(0, 5).map((material) => (
              <Chip
                key={material.id}
                label={`${material.name} (${material.stock_quantity} ${material.unit})`}
                size="small"
                color="warning"
                onClick={() => navigate(`/materials/detail/${material.id}`)}
              />
            ))}
            {lowStockMaterials.length > 5 && (
              <Chip
                label={`+ еще ${lowStockMaterials.length - 5}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Alert>
      )}

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Поиск по названию, артикулу"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Категория"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">Все</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Статус остатков</InputLabel>
                <Select
                  value={statusFilter}
                  label="Статус остатков"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="low">Низкий</MenuItem>
                  <MenuItem value="normal">Нормальный</MenuItem>
                  <MenuItem value="high">Высокий</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('');
                  setStatusFilter('');
                }}
              >
                Очистить фильтры
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Таблица материалов */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Материал</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Артикул</TableCell>
                  <TableCell>Остаток</TableCell>
                  <TableCell>Единица</TableCell>
                  <TableCell>Цена</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.map((material) => (
                  <TableRow 
                    key={material.id} 
                    hover 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/materials/detail/${material.id}`)}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                          <Inventory />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {material.name}
                          </Typography>
                          {material.description && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {material.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={material.category || 'Без категории'}
                        variant="outlined"
                        size="small"
                        icon={<Category />}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {material.sku || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        color={getStockStatusColor(material) === 'error' ? 'error.main' : 'text.primary'}
                      >
                        {material.stock_quantity}
                      </Typography>
                      {material.min_stock && (
                        <Typography variant="caption" color="text.secondary">
                          мин: {material.min_stock}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {material.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(material.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStockStatusLabel(material)}
                        color={getStockStatusColor(material)}
                        size="small"
                        icon={
                          getStockStatusColor(material) === 'error' ? <Warning /> : 
                          getStockStatusColor(material) === 'warning' ? <Warning /> : <CheckCircle />
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuClick(e, material.id);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {materials.length === 0 && !isLoading && (
            <Box textAlign="center" py={8}>
              <Inventory sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Материалы не найдены
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Попробуйте изменить критерии поиска или добавьте новый материал
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/materials/create')}
              >
                Добавить первый материал
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Контекстное меню */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewMaterial}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Просмотр</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditMaterial}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteMaterial} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      {/* Диалог импорта */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Импорт материалов из Excel</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Выберите Excel файл с данными материалов для импорта
          </Typography>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            style={{ marginTop: 16 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={handleImportMaterials}
            disabled={!importFile || importMaterialsMutation.isPending}
          >
            {importMaterialsMutation.isPending ? 'Импорт...' : 'Импортировать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialsList;