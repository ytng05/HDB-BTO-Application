FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY eligibility_service.py .

EXPOSE 5004

CMD ["python", "eligibility_service.py"]
