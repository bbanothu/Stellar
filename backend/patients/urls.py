from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, CustomFieldViewSet

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'custom-fields', CustomFieldViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 