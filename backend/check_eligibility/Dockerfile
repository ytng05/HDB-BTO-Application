FROM python:3.11-slim

WORKDIR /app

COPY requirements.py .
RUN pip install --no-cache-dir -r requirements.py

COPY . .

EXPOSE 5008

CMD ["python", "check_eligibility.py"]
