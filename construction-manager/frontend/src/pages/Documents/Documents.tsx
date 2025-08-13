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
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Description,
  PictureAsPdf,
  InsertDriveFile,
  Image,
  VideoFile,
  AudioFile,
  CloudUpload,
  Download,
  Share,
  Archive,
  Assignment,
  Person,
  DateRange,
} from '@mui/icons-material';
import dayjs from 'dayjs';

// Мок-данные для документов
const mockDocuments = [
  {
    id: '1',
    name: 'Проектная документация ЖК Солнечный.pdf',
    type: 'pdf',
    size: 15728640, // 15MB
    project_id: '1',
    project_name: 'ЖК Солнечный',
    category: 'project_docs',
    uploaded_by: 'Архитектор А.А.',
    uploaded_at: '2024-01-10',
    description: 'Полный комплект проектной документации',
    version: '1.2',
    status: 'approved',
  },
  {
    id: '2',
    name: 'Смета на строительные работы.xlsx',
    type: 'excel',
    size: 2048576, // 2MB
    project_id: '1',
    project_name: 'ЖК Солнечный',
    category: 'estimates',
    uploaded_by: 'Сметчик С.С.',
    uploaded_at: '2024-01-12',
    description: 'Детализированная смета на все виды работ',
    version: '2.0',
    status: 'draft',
  },
  {
    id: '3',
    name: 'Фото объекта 15.01.2024.jpg',
    type: 'image',
    size: 5242880, // 5MB
    project_id: '2',
    project_name: 'Офисный центр Бизнес-Плаза',
    category: 'photos',
    uploaded_by: 'Прораб П.П.',
    uploaded_at: '2024-01-15',
    description: 'Фотоотчет по состоянию объекта',
    version: '1.0',
    status: 'approved',
  },
];

const Documents: React.FC = () => {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const documents = mockDocuments.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || doc.category === categoryFilter;
    const matchesType = !typeFilter || doc.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, documentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(documentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <PictureAsPdf sx={{ color: '#f44336' }} />;
      case 'excel': return <InsertDriveFile sx={{ color: '#4caf50' }} />;
      case 'word': return <InsertDriveFile sx={{ color: '#2196f3' }} />;
      case 'image': return <Image sx={{ color: '#ff9800' }} />;
      case 'video': return <VideoFile sx={{ color: '#9c27b0' }} />;
      case 'audio': return <AudioFile sx={{ color: '#607d8b' }} />;
      default: return <Description sx={{ color: '#9e9e9e' }} />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'project_docs': return 'Проектная документация';
      case 'contracts': return 'Договоры';
      case 'estimates': return 'Сметы';
      case 'reports': return 'Отчеты';
      case 'photos': return 'Фотографии';
      case 'drawings': return 'Чертежи';
      case 'certificates': return 'Сертификаты';
      default: return category;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'archived': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Черновик';
      case 'approved': return 'Утвержден';
      case 'rejected': return 'Отклонен';
      case 'archived': return 'Архивирован';
      default: return status;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Управление документами
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={() => navigate('/documents/upload')}
        >
          Загрузить документ
        </Button>
      </Box>

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Поиск по названию, описанию"
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
                  <MenuItem value="project_docs">Проектная документация</MenuItem>
                  <MenuItem value="contracts">Договоры</MenuItem>
                  <MenuItem value="estimates">Сметы</MenuItem>
                  <MenuItem value="reports">Отчеты</MenuItem>
                  <MenuItem value="photos">Фотографии</MenuItem>
                  <MenuItem value="drawings">Чертежи</MenuItem>
                  <MenuItem value="certificates">Сертификаты</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Тип файла</InputLabel>
                <Select
                  value={typeFilter}
                  label="Тип файла"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                  <MenuItem value="word">Word</MenuItem>
                  <MenuItem value="image">Изображения</MenuItem>
                  <MenuItem value="video">Видео</MenuItem>
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
                  setTypeFilter('');
                }}
              >
                Очистить фильтры
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Статистика */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {documents.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего документов
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {documents.filter(d => d.status === 'approved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Утверждено
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {documents.filter(d => d.status === 'draft').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                В работе
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {(documents.reduce((sum, doc) => sum + doc.size, 0) / 1024 / 1024).toFixed(1)} MB
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Общий размер
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Таблица документов */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Документ</TableCell>
                  <TableCell>Проект</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Размер</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Загружен</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((document) => (
                  <TableRow 
                    key={document.id} 
                    hover 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/documents/detail/${document.id}`)}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'transparent' }}>
                          {getFileIcon(document.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold" noWrap>
                            {document.name}
                          </Typography>
                          {document.description && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {document.description}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Версия {document.version}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={document.project_name}
                        variant="outlined"
                        size="small"
                        icon={<Assignment />}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getCategoryLabel(document.category)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatFileSize(document.size)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(document.status)}
                        color={getStatusColor(document.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {dayjs(document.uploaded_at).format('DD.MM.YYYY')}
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <Person sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {document.uploaded_by}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuClick(e, document.id);
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

          {documents.length === 0 && (
            <Box textAlign="center" py={8}>
              <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Документы не найдены
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Попробуйте изменить критерии поиска или загрузите новый документ
              </Typography>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => navigate('/documents/upload')}
              >
                Загрузить документ
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
        <MenuItem onClick={() => {
          if (selectedDocument) navigate(`/documents/detail/${selectedDocument}`);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Просмотр</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          // Скачивание документа
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Скачать</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          // Поделиться документом
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Поделиться</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          if (selectedDocument) navigate(`/documents/edit/${selectedDocument}`);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Archive fontSize="small" />
          </ListItemIcon>
          <ListItemText>Архивировать</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Documents;