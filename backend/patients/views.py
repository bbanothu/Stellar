from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Patient, Address, CustomField, CustomFieldValue
from .serializers import (
    PatientSerializer, AddressSerializer,
    CustomFieldSerializer, CustomFieldValueSerializer
)

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['first_name', 'middle_name', 'last_name']
    ordering_fields = ['first_name', 'last_name', 'date_of_birth', 'status', 'created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def addresses(self, request, pk=None):
        patient = self.get_object()
        addresses = patient.addresses.all()
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def custom_fields(self, request, pk=None):
        patient = self.get_object()
        custom_fields = patient.custom_field_values.all()
        serializer = CustomFieldValueSerializer(custom_fields, many=True)
        return Response(serializer.data)

class CustomFieldViewSet(viewsets.ModelViewSet):
    queryset = CustomField.objects.all()
    serializer_class = CustomFieldSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'field_type', 'created_at']
    ordering = ['name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def values(self, request, pk=None):
        custom_field = self.get_object()
        values = custom_field.values.all()
        serializer = CustomFieldValueSerializer(values, many=True)
        return Response(serializer.data) 