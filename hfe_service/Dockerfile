FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY hfe_service.py .

EXPOSE 5014

CMD ["python", "hfe_service.py"]
