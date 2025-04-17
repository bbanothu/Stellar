from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User

class Patient(models.Model):
    STATUS_CHOICES = [
        ('INQUIRY', 'Inquiry'),
        ('ONBOARDING', 'Onboarding'),
        ('ACTIVE', 'Active'),
        ('CHURNED', 'Churned'),
    ]

    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='INQUIRY')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_patients')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        ordering = ['-created_at']

class Address(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='addresses')
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=20)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.street}, {self.city}, {self.state}"

    class Meta:
        ordering = ['-is_primary', '-created_at']
        verbose_name_plural = "Addresses"

class CustomField(models.Model):
    FIELD_TYPES = [
        ('TEXT', 'Text'),
        ('NUMBER', 'Number'),
        ('DATE', 'Date'),
    ]

    name = models.CharField(max_length=100)
    field_type = models.CharField(max_length=10, choices=FIELD_TYPES)
    is_required = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_fields')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class CustomFieldValue(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='custom_field_values')
    custom_field = models.ForeignKey(CustomField, on_delete=models.CASCADE, related_name='values')
    text_value = models.TextField(blank=True, null=True)
    number_value = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    date_value = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patient} - {self.custom_field}"

    class Meta:
        ordering = ['custom_field__name']
        unique_together = ['patient', 'custom_field'] 