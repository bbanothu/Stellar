from rest_framework import serializers
from .models import Patient, Address, CustomField, CustomFieldValue

class AddressSerializer(serializers.ModelSerializer):
    postal_code = serializers.CharField(source='zip_code', required=False)
    country = serializers.CharField(required=False)

    class Meta:
        model = Address
        fields = ['id', 'street', 'city', 'state', 'zip_code', 'postal_code', 'country', 'is_primary']
        extra_kwargs = {
            'id': {'read_only': True},
            'zip_code': {'required': False}
        }

class CustomFieldValueSerializer(serializers.ModelSerializer):
    field_name = serializers.CharField(source='custom_field.name', read_only=True)
    field_type = serializers.CharField(source='custom_field.field_type', read_only=True)

    class Meta:
        model = CustomFieldValue
        fields = ['id', 'custom_field', 'field_name', 'field_type', 'text_value', 'number_value', 'date_value']
        extra_kwargs = {
            'id': {'read_only': True},
            'custom_field': {'write_only': True}
        }

class PatientSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, required=False)
    custom_field_values = CustomFieldValueSerializer(many=True, required=False)
    full_name = serializers.SerializerMethodField()
    status = serializers.CharField(required=False)

    class Meta:
        model = Patient
        fields = ['id', 'first_name', 'middle_name', 'last_name', 'full_name', 
                 'date_of_birth', 'status', 'addresses', 'custom_field_values',
                 'created_at', 'updated_at', 'created_by']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.middle_name or ''} {obj.last_name}".strip()

    def validate_status(self, value):
        if not value:
            return 'INQUIRY'
        value = value.upper()
        valid_statuses = [choice[0] for choice in Patient.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Status must be one of: {', '.join(valid_statuses)}")
        return value

    def create(self, validated_data):
        addresses_data = validated_data.pop('addresses', [])
        custom_field_values_data = validated_data.pop('custom_field_values', [])
        
        patient = Patient.objects.create(**validated_data)
        
        for address_data in addresses_data:
            # Remove country field if it exists
            address_data.pop('country', None)
            Address.objects.create(patient=patient, **address_data)
            
        for field_value_data in custom_field_values_data:
            CustomFieldValue.objects.create(patient=patient, **field_value_data)
            
        return patient

    def update(self, instance, validated_data):
        addresses_data = validated_data.pop('addresses', [])
        custom_field_values_data = validated_data.pop('custom_field_values', [])
        
        # Update patient fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update addresses
        if addresses_data:
            instance.addresses.all().delete()
            for address_data in addresses_data:
                Address.objects.create(patient=instance, **address_data)
        
        # Update custom field values
        if custom_field_values_data:
            instance.custom_field_values.all().delete()
            for field_value_data in custom_field_values_data:
                CustomFieldValue.objects.create(patient=instance, **field_value_data)
        
        return instance

class CustomFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomField
        fields = ['id', 'name', 'field_type', 'is_required', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at'] 