import { Injectable } from '@angular/core';
import { Event } from '../models/event.model';
import { EventQuiz, QuizQuestion } from '../models/quiz.model';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  /**
   * Genera un quiz automáticamente basado en el contenido del evento
   */
  generateEventQuiz(event: Event): EventQuiz {
    const questions: QuizQuestion[] = [];

    // Pregunta sobre la fecha
    questions.push(this.createDateQuestion(event));

    // Pregunta sobre la categoría
    questions.push(this.createCategoryQuestion(event));

    // Preguntas sobre datos curiosos
    if (event.keyFacts && event.keyFacts.length > 0) {
      questions.push(...this.createFactQuestions(event));
    }

    // Preguntas sobre cronología
    if (event.timeline && event.timeline.length > 0) {
      questions.push(this.createTimelineQuestion(event));
    }

    // Mezclar las preguntas para variar el orden
    const shuffledQuestions = this.shuffleArray(questions);

    return {
      eventId: event.id,
      eventTitle: event.title,
      questions: shuffledQuestions.slice(0, 5), // Máximo 5 preguntas por quiz
    };
  }

  private createDateQuestion(event: Event): QuizQuestion {
    const eventDate = new Date(event.date);

    // Validar la fecha del evento
    if (isNaN(eventDate.getTime())) {
      console.warn('Invalid event date:', event.date);
      // Usar fecha por defecto si la fecha del evento es inválida
      eventDate.setFullYear(2020);
    }

    const correctYear = eventDate.getFullYear();
    const correctAnswer = correctYear.toString();

    // Generar opciones de año válidas
    const options = [
      correctAnswer,
      (correctYear - 1).toString(),
      (correctYear + 1).toString(),
      (correctYear - 2).toString(),
    ];

    // Validar que todas las opciones sean strings válidas
    const validOptions = options.filter((option) => option && option !== 'NaN').slice(0, 4);

    // Si no tenemos suficientes opciones válidas, generar alternativas
    while (validOptions.length < 4) {
      const randomYear = correctYear + Math.floor(Math.random() * 10) - 5;
      const yearOption = randomYear.toString();
      if (!validOptions.includes(yearOption) && yearOption !== 'NaN') {
        validOptions.push(yearOption);
      }
    }

    // Mezclar opciones y encontrar el nuevo índice de la respuesta correcta
    const shuffledOptions = this.shuffleArray(validOptions);
    const correctAnswerIndex = shuffledOptions.indexOf(correctAnswer);

    return {
      id: `date-${event.id}`,
      question: `¿En qué año ocurrió el evento "${event.title}"?`,
      options: shuffledOptions,
      correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
      explanation: `El evento ocurrió en ${correctYear}.`,
    };
  }

  private createCategoryQuestion(event: Event): QuizQuestion {
    const categories = [
      'Ciencia',
      'Política',
      'Tecnología',
      'Historia',
      'Cultura',
      'Economía',
      'Deporte',
      'Arte',
    ];
    const correctCategory = event.category.trim();

    // Filtrar categorías diferentes a la correcta
    const wrongCategories = categories.filter((cat) => cat !== correctCategory);

    const options = [correctCategory, ...wrongCategories.slice(0, 3)];

    // Mezclar opciones y encontrar el nuevo índice de la respuesta correcta
    const shuffledOptions = this.shuffleArray(options);
    const correctAnswerIndex = shuffledOptions.indexOf(correctCategory);

    return {
      id: `category-${event.id}`,
      question: `¿A qué categoría pertenece el evento "${event.title}"?`,
      options: shuffledOptions,
      correctAnswer: correctAnswerIndex,
      explanation: `Este evento pertenece a la categoría: ${correctCategory}.`,
    };
  }

  private createFactQuestions(event: Event): QuizQuestion[] {
    const questions: QuizQuestion[] = [];

    // Tomar máximo 2 datos curiosos para hacer preguntas
    const selectedFacts = event.keyFacts.slice(0, 2);

    selectedFacts.forEach((fact, index) => {
      // Crear pregunta sobre el dato curioso
      const question: QuizQuestion = {
        id: `fact-${event.id}-${index}`,
        question: `Según los datos curiosos del evento, ¿qué es cierto sobre "${fact.title}"?`,
        options: [
          fact.description,
          this.generateWrongOption(fact.description, 'distractor1'),
          this.generateWrongOption(fact.description, 'distractor2'),
          this.generateWrongOption(fact.description, 'distractor3'),
        ],
        correctAnswer: 0,
        explanation: `La respuesta correcta es: ${fact.description}`,
      };

      // Mezclar las opciones y actualizar el índice correcto
      const shuffledOptions = this.shuffleArray(question.options);
      question.correctAnswer = shuffledOptions.indexOf(fact.description);
      question.options = shuffledOptions;

      questions.push(question);
    });

    return questions;
  }

  private createTimelineQuestion(event: Event): QuizQuestion {
    if (event.timeline.length === 0) {
      throw new Error('No timeline data available');
    }

    const randomTimelineItem = event.timeline[Math.floor(Math.random() * event.timeline.length)];
    const timelineDate = new Date(randomTimelineItem.date);

    // Validar la fecha del timeline
    if (isNaN(timelineDate.getTime())) {
      console.warn('Invalid timeline date:', randomTimelineItem.date);
      timelineDate.setFullYear(2020);
    }

    const correctYear = timelineDate.getFullYear();
    const correctAnswer = correctYear.toString();

    const options = [
      correctAnswer,
      (correctYear - 2).toString(),
      (correctYear + 1).toString(),
      (correctYear - 5).toString(),
    ];

    // Validar que todas las opciones sean strings válidas
    const validOptions = options.filter((option) => option && option !== 'NaN').slice(0, 4);

    // Si no tenemos suficientes opciones válidas, generar alternativas
    while (validOptions.length < 4) {
      const randomYear = correctYear + Math.floor(Math.random() * 10) - 5;
      const yearOption = randomYear.toString();
      if (!validOptions.includes(yearOption) && yearOption !== 'NaN') {
        validOptions.push(yearOption);
      }
    }

    // Mezclar opciones y encontrar el nuevo índice de la respuesta correcta
    const shuffledOptions = this.shuffleArray(validOptions);
    const correctAnswerIndex = shuffledOptions.indexOf(correctAnswer);

    return {
      id: `timeline-${event.id}`,
      question: `¿En qué año ocurrió lo siguiente: "${randomTimelineItem.event}"?`,
      options: shuffledOptions,
      correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
      explanation: `Este evento de la cronología ocurrió en ${correctYear}.`,
    };
  }

  private generateWrongOption(correctAnswer: string, type: string): string {
    // Generar opciones incorrectas pero plausibles
    const wrongOptions = {
      distractor1: 'Esta información no está relacionada con el evento principal.',
      distractor2: 'Este dato corresponde a un evento histórico diferente.',
      distractor3: 'Esta descripción no es exacta según los datos del evento.',
    };

    // Si la respuesta correcta contiene números, generar números similares pero incorrectos
    const numberMatch = correctAnswer.match(/\d+/);
    if (numberMatch) {
      const originalNumber = parseInt(numberMatch[0]);
      const variations = [
        correctAnswer.replace(numberMatch[0], (originalNumber + 1).toString()),
        correctAnswer.replace(numberMatch[0], (originalNumber - 1).toString()),
        correctAnswer.replace(numberMatch[0], (originalNumber * 2).toString()),
      ];

      const randomVariation = variations[Math.floor(Math.random() * variations.length)];
      return randomVariation;
    }

    return wrongOptions[type as keyof typeof wrongOptions] || 'Opción incorrecta';
  }

  private shuffleArray<T>(array: T[]): T[] {
    // Validar y filtrar elementos inválidos
    const validArray = array.filter((item) => {
      if (item === null || item === undefined) return false;
      if (typeof item === 'number' && isNaN(item)) return false;
      return true;
    });

    if (validArray.length === 0) {
      console.warn('shuffleArray: No valid elements found in array:', array);
      return ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'] as T[];
    }

    const shuffled = [...validArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Calcula el resultado del quiz
   */
  calculateScore(totalQuestions: number, correctAnswers: number): number {
    if (totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
  }

  /**
   * Obtiene el mensaje de felicitación basado en la puntuación
   */
  getScoreMessage(percentage: number): { message: string; color: string; icon: string } {
    if (percentage >= 90) {
      return {
        message: '¡Excelente! Eres un verdadero experto en historia.',
        color: 'text-green-600',
        icon: 'fas fa-trophy',
      };
    } else if (percentage >= 70) {
      return {
        message: '¡Muy bien! Tienes buenos conocimientos sobre este evento.',
        color: 'text-blue-600',
        icon: 'fas fa-medal',
      };
    } else if (percentage >= 50) {
      return {
        message: 'Bien hecho. Puedes mejorar leyendo más sobre el evento.',
        color: 'text-yellow-600',
        icon: 'fas fa-star',
      };
    } else {
      return {
        message: 'Sigue estudiando. ¡La historia tiene muchos secretos por descubrir!',
        color: 'text-red-600',
        icon: 'fas fa-book',
      };
    }
  }
}
