FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ballot_application.py .

EXPOSE 5010

CMD ["python", "ballot_application.py"]
